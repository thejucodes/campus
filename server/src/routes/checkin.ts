import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { verifyTicketToken } from '../utils/qrToken.js';

export const checkinRouter = Router();

// Get list of events available for check-in by current organizer / staff
checkinRouter.get('/events', authenticateToken, requireRole('organizer', 'approver', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    let sql = `
      SELECT 
        e.id, e.title, e.event_date, e.start_time, e.end_time, e.venue_name, e.status, e.max_capacity,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status != 'CANCELLED') as total_registered,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CHECKED_IN') as total_checked_in
      FROM events e
      WHERE e.status IN ('APPROVED', 'PUBLISHED')
    `;
    const params: any[] = [];

    if (user.role === 'organizer') {
      sql += ` AND e.organizer_id = ?`;
      params.push(user.id);
    }

    sql += ` ORDER BY e.event_date DESC, e.start_time DESC`;

    const events = db.prepare(sql).all(...params);
    res.json({ events });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch check-in events' });
  }
});

// Get Live Attendance details for an event
checkinRouter.get('/events/:eventId/attendees', authenticateToken, requireRole('organizer', 'approver', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { eventId } = req.params;

    const event = db.prepare('SELECT id, title, event_date, start_time, end_time, venue_name, max_capacity FROM events WHERE id = ?').get(eventId) as any;
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const attendees = db.prepare(`
      SELECT 
        id as registration_id,
        student_name,
        student_email,
        student_department,
        status,
        registered_at,
        checked_in_at
      FROM registrations
      WHERE event_id = ?
      ORDER BY 
        CASE WHEN status = 'CHECKED_IN' THEN 1 ELSE 2 END,
        checked_in_at DESC,
        registered_at DESC
    `).all(eventId) as any[];

    const totalRegistered = attendees.filter(a => a.status !== 'CANCELLED').length;
    const totalCheckedIn = attendees.filter(a => a.status === 'CHECKED_IN').length;
    const pendingArrival = totalRegistered - totalCheckedIn;
    const attendanceRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

    res.json({
      event,
      stats: {
        totalRegistered,
        totalCheckedIn,
        pendingArrival,
        attendanceRate,
        capacity: event.max_capacity
      },
      attendees
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch attendance details' });
  }
});

// Perform Check-in Scan or Manual Verification
checkinRouter.post('/verify', authenticateToken, requireRole('organizer', 'approver', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { eventId, tokenOrCode } = req.body;
    const checker = req.user!;

    if (!eventId || !tokenOrCode) {
      res.status(400).json({ error: 'Both eventId and tokenOrCode are required' });
      return;
    }

    const cleanedCode = tokenOrCode.trim();

    // Check if tokenOrCode is a signed ticket token or a direct registration code
    let regRecord: any = null;

    if (cleanedCode.startsWith('CPTKT_')) {
      const parsed = verifyTicketToken(cleanedCode);
      if (!parsed.valid || !parsed.registrationId) {
        res.status(400).json({
          outcome: 'INVALID_SIGNATURE',
          message: 'QR code signature is invalid or has been tampered with.'
        });
        return;
      }
      regRecord = db.prepare('SELECT * FROM registrations WHERE id = ?').get(parsed.registrationId);
    } else {
      // Lookup by registration ID code or exact ticket token
      regRecord = db.prepare('SELECT * FROM registrations WHERE id = ? OR ticket_token = ?').get(cleanedCode, cleanedCode);
    }

    if (!regRecord) {
      res.status(404).json({
        outcome: 'NOT_FOUND',
        message: 'No registration record found for this ticket code.'
      });
      return;
    }

    // Validation 1: Event match
    if (regRecord.event_id !== eventId) {
      const wrongEvent = db.prepare('SELECT title FROM events WHERE id = ?').get(regRecord.event_id) as any;
      res.status(400).json({
        outcome: 'WRONG_EVENT',
        message: `This ticket is registered for a different event: "${wrongEvent ? wrongEvent.title : 'Another Event'}"`,
        attendee: {
          name: regRecord.student_name,
          email: regRecord.student_email
        }
      });
      return;
    }

    // Validation 2: Status check
    if (regRecord.status === 'CANCELLED') {
      res.status(400).json({
        outcome: 'CANCELLED_TICKET',
        message: 'This registration ticket was cancelled by the student.',
        attendee: {
          name: regRecord.student_name,
          email: regRecord.student_email
        }
      });
      return;
    }

    if (regRecord.status === 'CHECKED_IN') {
      res.status(409).json({
        outcome: 'ALREADY_CHECKED_IN',
        message: `Already checked in at ${new Date(regRecord.checked_in_at).toLocaleTimeString()}`,
        attendee: {
          name: regRecord.student_name,
          email: regRecord.student_email,
          department: regRecord.student_department,
          registrationId: regRecord.id,
          checkedInAt: regRecord.checked_in_at
        }
      });
      return;
    }

    // Atomic check-in update
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE registrations 
      SET status = 'CHECKED_IN', checked_in_at = ?, checked_in_by = ?
      WHERE id = ? AND status = 'REGISTERED'
    `).run(now, checker.id, regRecord.id);

    // Fetch updated stats
    const updatedStats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM registrations WHERE event_id = ? AND status != 'CANCELLED') as total,
        (SELECT COUNT(*) FROM registrations WHERE event_id = ? AND status = 'CHECKED_IN') as checked_in
    `).get(eventId, eventId) as { total: number; checked_in: number };

    res.json({
      outcome: 'SUCCESS',
      message: 'Check-in Verified Successfully!',
      attendee: {
        name: regRecord.student_name,
        email: regRecord.student_email,
        department: regRecord.student_department,
        registrationId: regRecord.id,
        registeredAt: regRecord.registered_at,
        checkedInAt: now
      },
      stats: {
        totalRegistered: updatedStats.total,
        totalCheckedIn: updatedStats.checked_in,
        attendanceRate: updatedStats.total > 0 ? Math.round((updatedStats.checked_in / updatedStats.total) * 100) : 0
      }
    });
  } catch (err: any) {
    console.error('Checkin error:', err);
    res.status(500).json({ error: 'Server error during check-in validation' });
  }
});
