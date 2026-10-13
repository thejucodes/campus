import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { generateRegistrationCode, generateTicketToken } from '../utils/qrToken.js';

export const registrationsRouter = Router();

// Register for an event
registrationsRouter.post('/events/:eventId/register', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { eventId } = req.params;
    const userId = req.user!.id;
    const studentName = req.user!.name;
    const studentEmail = req.user!.email;
    const studentDepartment = req.user!.department || '';

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as any;
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (!['APPROVED', 'PUBLISHED'].includes(event.status)) {
      res.status(400).json({ error: 'Registrations are not open for this event.' });
      return;
    }

    // Check registration deadline
    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      if (new Date() > deadline) {
        res.status(400).json({ error: 'Registration deadline has passed for this event.' });
        return;
      }
    }

    // Check if duplicate registration
    const existing = db.prepare('SELECT id, status FROM registrations WHERE event_id = ? AND user_id = ?').get(eventId, userId) as any;
    if (existing) {
      if (existing.status === 'CANCELLED') {
        // Re-activate registration
        const newCode = generateRegistrationCode(eventId, userId);
        const newToken = generateTicketToken(newCode, eventId, userId);
        db.prepare(`
          UPDATE registrations 
          SET id = ?, ticket_token = ?, status = 'REGISTERED', registered_at = CURRENT_TIMESTAMP 
          WHERE event_id = ? AND user_id = ?
        `).run(newCode, newToken, eventId, userId);

        res.json({
          message: 'Registration re-activated successfully!',
          registrationId: newCode,
          ticketToken: newToken
        });
        return;
      }
      res.status(409).json({ error: 'You are already registered for this event.' });
      return;
    }

    // Server-side Capacity check
    const countRow = db.prepare(`SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != 'CANCELLED'`).get(eventId) as { count: number };
    if (countRow.count >= event.max_capacity) {
      res.status(400).json({ error: 'Event has reached its maximum capacity. No seats available.' });
      return;
    }

    // Create registration code and signed token
    const regCode = generateRegistrationCode(eventId, userId);
    const ticketToken = generateTicketToken(regCode, eventId, userId);

    db.prepare(`
      INSERT INTO registrations (id, event_id, user_id, student_name, student_email, student_department, ticket_token, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'REGISTERED')
    `).run(regCode, eventId, userId, studentName, studentEmail, studentDepartment, ticketToken);

    // Create notification
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, 'registration')
    `).run(
      'notif_' + crypto.randomBytes(6).toString('hex'),
      userId,
      'Registration Confirmed!',
      `You are registered for "${event.title}". Your QR ticket is ready in My Registrations.`
    );

    res.status(201).json({
      message: 'Successfully registered!',
      registration: {
        id: regCode,
        eventId,
        ticketToken,
        status: 'REGISTERED',
        eventTitle: event.title,
        venueName: event.venue_name,
        eventDate: event.event_date,
        startTime: event.start_time,
        endTime: event.end_time
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error while processing registration' });
  }
});

// Get Current Student's Registrations
registrationsRouter.get('/my', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { statusFilter } = req.query;

    let sql = `
      SELECT 
        r.id as registration_id,
        r.ticket_token,
        r.status as registration_status,
        r.registered_at,
        r.checked_in_at,
        e.id as event_id,
        e.title as event_title,
        e.short_summary,
        e.category,
        e.event_date,
        e.start_time,
        e.end_time,
        e.venue_name,
        e.organizer_club,
        e.cover_image,
        e.status as event_status
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = ?
    `;
    const params: any[] = [userId];

    const todayStr = new Date().toISOString().split('T')[0];

    if (statusFilter === 'completed') {
      sql += ` AND (r.status = 'CHECKED_IN' OR (r.status = 'REGISTERED' AND e.event_date < ?))`;
      params.push(todayStr);
    } else if (statusFilter === 'cancelled') {
      sql += ` AND r.status = 'CANCELLED'`;
    } else if (statusFilter === 'upcoming') {
      sql += ` AND r.status != 'CANCELLED' AND e.event_date >= ?`;
      params.push(todayStr);
    }

    sql += ` ORDER BY e.event_date ASC, e.start_time ASC`;

    const registrations = db.prepare(sql).all(...params);
    res.json({ registrations });
  } catch (err: any) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Cancel Registration
registrationsRouter.post('/:id/cancel', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id) as any;
    if (!reg) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    if (reg.user_id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to cancel this registration' });
      return;
    }

    if (reg.status === 'CHECKED_IN') {
      res.status(400).json({ error: 'Cannot cancel a registration that has already been checked in.' });
      return;
    }

    db.prepare(`UPDATE registrations SET status = 'CANCELLED' WHERE id = ?`).run(id);

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

// Get Individual Ticket by Registration ID (Access-Controlled)
registrationsRouter.get('/:id/ticket', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const ticket = db.prepare(`
      SELECT 
        r.id as registration_id,
        r.ticket_token,
        r.status as ticket_status,
        r.registered_at,
        r.checked_in_at,
        r.student_name,
        r.student_email,
        r.student_department,
        e.id as event_id,
        e.title as event_title,
        e.category,
        e.event_date,
        e.start_time,
        e.end_time,
        e.venue_name,
        e.organizer_club,
        e.organizer_id
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `).get(id) as any;

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    // Security check: Must be ticket owner, or organizer of event, or approver/admin
    const isOwner = ticket.student_email === req.user!.email || ticket.student_name === req.user!.name;
    const isOrganizer = ticket.organizer_id === userId;
    const isStaff = ['approver', 'admin'].includes(req.user!.role);

    if (!isOwner && !isOrganizer && !isStaff) {
      res.status(403).json({ error: 'Access denied: You cannot view another student’s ticket.' });
      return;
    }

    res.json({ ticket });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Download RFC 5545 iCalendar (.ics)
registrationsRouter.get('/:id/ics', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const reg = db.prepare(`
      SELECT r.id, e.title, e.description, e.event_date, e.start_time, e.end_time, e.venue_name, e.organizer_club
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `).get(id) as any;

    if (!reg) {
      res.status(404).send('Event not found');
      return;
    }

    // Format dates to YYYYMMDDTHHMMSS
    const [year, month, day] = reg.event_date.split('-');
    const [startH, startM] = reg.start_time.split(':');
    const [endH, endM] = reg.end_time.split(':');

    const dtStart = `${year}${month}${day}T${startH}${startM}00`;
    const dtEnd = `${year}${month}${day}T${endH}${endM}00`;
    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusPulse//SYNESIS 26//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${reg.id}@campuspulse.edu`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${reg.title}`,
      `DESCRIPTION:${(reg.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${reg.venue_name}`,
      `ORGANIZER;CN=${reg.organizer_club}:mailto:events@campuspulse.edu`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${reg.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`);
    res.send(icsContent);
  } catch (err: any) {
    res.status(500).send('Failed to generate calendar file');
  }
});
