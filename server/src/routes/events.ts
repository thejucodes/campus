import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { authenticateToken, optionalAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { checkVenueConflict } from '../utils/conflictChecker.js';

export const eventsRouter = Router();

// Public Discovery: GET /events
eventsRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { search, category, dateFilter, venueId, sortBy } = req.query;
    const userId = req.user?.id;

    let sql = `
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status != 'CANCELLED') as registered_count
      FROM events e
      WHERE e.status IN ('APPROVED', 'PUBLISHED')
    `;
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ` AND (e.title LIKE ? OR e.description LIKE ? OR e.organizer_club LIKE ? OR e.venue_name LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (category && typeof category === 'string' && category !== 'All') {
      sql += ` AND e.category = ?`;
      params.push(category);
    }

    if (venueId && typeof venueId === 'string' && venueId !== 'All') {
      sql += ` AND e.venue_id = ?`;
      params.push(venueId);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (dateFilter === 'past') {
      sql += ` AND e.event_date < ?`;
      params.push(todayStr);
    } else if (dateFilter === 'today') {
      sql += ` AND e.event_date = ?`;
      params.push(todayStr);
    } else if (dateFilter === 'all') {
      // no date restriction
    } else {
      // Default: upcoming events
      sql += ` AND e.event_date >= ?`;
      params.push(todayStr);
    }

    // Sorting
    if (sortBy === 'popularity') {
      sql += ` ORDER BY registered_count DESC, e.event_date ASC`;
    } else if (sortBy === 'date-desc') {
      sql += ` ORDER BY e.event_date DESC, e.start_time DESC`;
    } else {
      // Default: date-asc
      sql += ` ORDER BY e.event_date ASC, e.start_time ASC`;
    }

    const events = db.prepare(sql).all(...params) as any[];

    // If user is logged in, attach their registration status
    let userRegistrations: Record<string, any> = {};
    if (userId) {
      const regRows = db.prepare(`SELECT event_id, id as registration_id, status FROM registrations WHERE user_id = ?`).all(userId) as any[];
      userRegistrations = regRows.reduce((acc, r) => {
        acc[r.event_id] = r;
        return acc;
      }, {});
    }

    const enriched = events.map(e => ({
      ...e,
      remaining_seats: Math.max(0, e.max_capacity - (e.registered_count || 0)),
      is_full: (e.registered_count || 0) >= e.max_capacity,
      user_registration: userRegistrations[e.id] || null
    }));

    res.json({ events: enriched });
  } catch (err: any) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Personalized Recommendations
eventsRouter.get('/recommendations', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    let interests: string[] = [];

    if (userId) {
      const userRecord = db.prepare('SELECT interests FROM users WHERE id = ?').get(userId) as any;
      if (userRecord && userRecord.interests) {
        try {
          interests = JSON.parse(userRecord.interests);
        } catch (e) {
          interests = [];
        }
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Get all upcoming approved events
    const events = db.prepare(`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status != 'CANCELLED') as registered_count
      FROM events e
      WHERE e.status IN ('APPROVED', 'PUBLISHED')
        AND e.event_date >= ?
      ORDER BY e.event_date ASC
    `).all(todayStr) as any[];

    // Calculate score
    const scored = events.map(ev => {
      let score = 0;
      let matchedInterest = false;

      if (interests.length > 0 && interests.includes(ev.category)) {
        score += 50;
        matchedInterest = true;
      }

      // Add popularity score
      score += Math.min(30, ev.registered_count * 2);

      return {
        ...ev,
        remaining_seats: Math.max(0, ev.max_capacity - (ev.registered_count || 0)),
        is_full: (ev.registered_count || 0) >= ev.max_capacity,
        score,
        recommendation_type: matchedInterest ? 'interest-matched' : 'trending',
        recommendation_reason: matchedInterest 
          ? `Matches your interest in ${ev.category}` 
          : 'High campus registration engagement'
      };
    });

    scored.sort((a, b) => b.score - a.score);

    res.json({
      recommendations: scored.slice(0, 4),
      userInterests: interests
    });
  } catch (err: any) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get Event by ID
eventsRouter.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const event = db.prepare(`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status != 'CANCELLED') as registered_count,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CHECKED_IN') as checked_in_count
      FROM events e
      WHERE e.id = ?
    `).get(id) as any;

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    let userRegistration = null;
    if (userId) {
      userRegistration = db.prepare(`
        SELECT id as registration_id, ticket_token, status, registered_at, checked_in_at
        FROM registrations 
        WHERE event_id = ? AND user_id = ?
      `).get(id, userId);
    }

    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(event.venue_id);

    res.json({
      event: {
        ...event,
        remaining_seats: Math.max(0, event.max_capacity - (event.registered_count || 0)),
        is_full: (event.registered_count || 0) >= event.max_capacity,
        user_registration: userRegistration || null,
        venue
      }
    });
  } catch (err: any) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Create Event (Draft or Submit)
eventsRouter.post('/', authenticateToken, requireRole('organizer', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      title,
      short_summary,
      description,
      category,
      event_date,
      start_time,
      end_time,
      venue_id,
      expected_audience,
      max_capacity,
      registration_deadline,
      eligibility,
      cover_image,
      flyer_path,
      additional_info,
      submitForApproval = false
    } = req.body;

    if (!title || !description || !category || !event_date || !start_time || !end_time || !venue_id) {
      res.status(400).json({ error: 'Missing required event fields' });
      return;
    }

    if (end_time <= start_time) {
      res.status(400).json({ error: 'End time must be after start time' });
      return;
    }

    // Fetch venue name
    const venue = db.prepare('SELECT name FROM venues WHERE id = ?').get(venue_id) as any;
    if (!venue) {
      res.status(400).json({ error: 'Selected venue does not exist' });
      return;
    }

    // Check venue conflict
    const conflictResult = checkVenueConflict(venue_id, event_date, start_time, end_time);
    
    // If user is submitting for approval and conflict exists, strictly block
    if (submitForApproval && conflictResult.hasConflict) {
      res.status(409).json({
        error: 'Cannot submit for approval: A venue schedule conflict exists for the selected time slot.',
        conflictResult
      });
      return;
    }

    const eventId = 'evt_' + crypto.randomBytes(8).toString('hex');
    const status = submitForApproval ? 'PENDING_APPROVAL' : 'DRAFT';

    const organizerName = req.user!.name;
    const organizerClub = req.user!.organization || 'Campus Student Organization';

    db.prepare(`
      INSERT INTO events (
        id, title, short_summary, description, category, event_date, start_time, end_time,
        venue_id, venue_name, expected_audience, max_capacity, registration_deadline,
        eligibility, organizer_id, organizer_name, organizer_club, cover_image, flyer_path,
        additional_info, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      title,
      short_summary || title,
      description,
      category,
      event_date,
      start_time,
      end_time,
      venue_id,
      venue.name,
      expected_audience || 'Open to All',
      Number(max_capacity) || 100,
      registration_deadline || `${event_date}T${start_time}`,
      eligibility || 'Open to all students',
      req.user!.id,
      organizerName,
      organizerClub,
      cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
      flyer_path || '',
      additional_info || '',
      status
    );

    // If submitted for approval, create a notification for approvers
    if (status === 'PENDING_APPROVAL') {
      const approvers = db.prepare(`SELECT id FROM users WHERE role IN ('approver', 'admin')`).all() as any[];
      const notifStmt = db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type)
        VALUES (?, ?, ?, ?, ?)
      `);
      approvers.forEach(appr => {
        notifStmt.run(
          'notif_' + crypto.randomBytes(6).toString('hex'),
          appr.id,
          'New Event Submission Pending Approval',
          `Event "${title}" submitted by ${organizerClub} requires your review.`,
          'approval'
        );
      });
    }

    res.status(201).json({
      message: status === 'PENDING_APPROVAL' ? 'Event submitted for approval successfully!' : 'Event draft saved.',
      eventId,
      status,
      hasConflictNotice: conflictResult.hasConflict,
      conflictResult: conflictResult.hasConflict ? conflictResult : null
    });
  } catch (err: any) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Server error while creating event' });
  }
});

// Update Event: PUT /events/:id
eventsRouter.put('/:id', authenticateToken, requireRole('organizer', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as any;

    if (!existing) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Only owner or admin can edit
    if (existing.organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You are not authorized to edit this event' });
      return;
    }

    // Cannot edit approved or published events directly unless admin
    if (['APPROVED', 'PUBLISHED'].includes(existing.status) && req.user!.role !== 'admin') {
      res.status(400).json({ error: 'Approved or published events cannot be edited directly without re-approval' });
      return;
    }

    const {
      title,
      short_summary,
      description,
      category,
      event_date,
      start_time,
      end_time,
      venue_id,
      expected_audience,
      max_capacity,
      registration_deadline,
      eligibility,
      cover_image,
      flyer_path,
      additional_info,
      submitForApproval
    } = req.body;

    const vId = venue_id || existing.venue_id;
    const eDate = event_date || existing.event_date;
    const sTime = start_time || existing.start_time;
    const eTime = end_time || existing.end_time;

    if (eTime <= sTime) {
      res.status(400).json({ error: 'End time must be after start time' });
      return;
    }

    const venue = db.prepare('SELECT name FROM venues WHERE id = ?').get(vId) as any;
    const venueName = venue ? venue.name : existing.venue_name;

    // Check conflict
    const conflictResult = checkVenueConflict(vId, eDate, sTime, eTime, id);

    let newStatus = existing.status;
    if (submitForApproval) {
      if (conflictResult.hasConflict) {
        res.status(409).json({
          error: 'Cannot submit for approval: A venue schedule conflict exists for the selected time slot.',
          conflictResult
        });
        return;
      }
      newStatus = 'PENDING_APPROVAL';
    }

    db.prepare(`
      UPDATE events SET
        title = ?, short_summary = ?, description = ?, category = ?, event_date = ?,
        start_time = ?, end_time = ?, venue_id = ?, venue_name = ?, expected_audience = ?,
        max_capacity = ?, registration_deadline = ?, eligibility = ?, cover_image = ?,
        flyer_path = ?, additional_info = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ?? existing.title,
      short_summary ?? existing.short_summary,
      description ?? existing.description,
      category ?? existing.category,
      eDate,
      sTime,
      eTime,
      vId,
      venueName,
      expected_audience ?? existing.expected_audience,
      max_capacity ? Number(max_capacity) : existing.max_capacity,
      registration_deadline ?? existing.registration_deadline,
      eligibility ?? existing.eligibility,
      cover_image ?? existing.cover_image,
      flyer_path ?? existing.flyer_path,
      additional_info ?? existing.additional_info,
      newStatus,
      id
    );

    res.json({
      message: 'Event updated successfully',
      status: newStatus,
      conflictResult: conflictResult.hasConflict ? conflictResult : null
    });
  } catch (err: any) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Submit draft for approval
eventsRouter.post('/:id/submit', authenticateToken, requireRole('organizer', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as any;

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to submit this event' });
      return;
    }

    // Check conflict
    const conflictResult = checkVenueConflict(event.venue_id, event.event_date, event.start_time, event.end_time, id);
    if (conflictResult.hasConflict) {
      res.status(409).json({
        error: 'Cannot submit for approval: A venue schedule conflict exists for this time slot.',
        conflictResult
      });
      return;
    }

    db.prepare(`UPDATE events SET status = 'PENDING_APPROVAL', rejection_reason = '', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(id);

    res.json({ success: true, message: 'Event submitted for approval' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit event' });
  }
});
