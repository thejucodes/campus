import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { checkVenueConflict } from '../utils/conflictChecker.js';

export const approvalsRouter = Router();

// Approver/Admin: Get pending events with conflict checks
approvalsRouter.get('/pending', authenticateToken, requireRole('approver', 'admin'), (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const events = db.prepare(`
      SELECT e.*, u.email as organizer_email, u.department as organizer_department
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.status = 'PENDING_APPROVAL'
      ORDER BY e.created_at DESC
    `).all() as any[];

    // Recheck venue conflict for each pending event
    const enriched = events.map(event => {
      const conflictResult = checkVenueConflict(event.venue_id, event.event_date, event.start_time, event.end_time, event.id);
      return {
        ...event,
        venueConflict: conflictResult
      };
    });

    res.json({ pendingEvents: enriched });
  } catch (err: any) {
    console.error('Error fetching pending approvals:', err);
    res.status(500).json({ error: 'Failed to fetch pending events' });
  }
});

// Approver/Admin: Get approval history
approvalsRouter.get('/history', authenticateToken, requireRole('approver', 'admin'), (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const history = db.prepare(`
      SELECT 
        h.*,
        e.title as event_title,
        e.category,
        e.event_date,
        e.venue_name,
        e.organizer_club
      FROM approvals_history h
      JOIN events e ON h.event_id = e.id
      ORDER BY h.action_timestamp DESC
      LIMIT 50
    `).all();

    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch approval history' });
  }
});

// Approve an event
approvalsRouter.post('/:eventId/approve', authenticateToken, requireRole('approver', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { eventId } = req.params;
    const { comments = 'Event meets all campus guidelines and venue policies.' } = req.body;
    const approver = req.user!;

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as any;
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status !== 'PENDING_APPROVAL') {
      res.status(400).json({ error: `Event is currently '${event.status}', not 'PENDING_APPROVAL'.` });
      return;
    }

    // Safety: prevent organizers from approving their own event unless they are an admin
    if (event.organizer_id === approver.id && approver.role !== 'admin') {
      res.status(403).json({ error: 'Conflict of interest: Organizers cannot approve their own events.' });
      return;
    }

    // Server-side venue conflict recheck
    const conflictResult = checkVenueConflict(event.venue_id, event.event_date, event.start_time, event.end_time, event.id);
    if (conflictResult.hasConflict) {
      res.status(409).json({
        error: 'Cannot approve event: A venue schedule conflict exists with another approved event.',
        conflictResult
      });
      return;
    }

    const previousStatus = event.status;
    const newStatus = 'APPROVED';

    // Transactional update
    const historyId = 'appr_' + crypto.randomBytes(6).toString('hex');

    const updateTx = db.transaction(() => {
      db.prepare(`UPDATE events SET status = ?, rejection_reason = '', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newStatus, eventId);
      db.prepare(`
        INSERT INTO approvals_history (id, event_id, approver_id, approver_name, previous_status, new_status, action, comments)
        VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?)
      `).run(historyId, eventId, approver.id, approver.name, previousStatus, newStatus, comments);

      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type)
        VALUES (?, ?, ?, ?, 'approval')
      `).run(
        'notif_' + crypto.randomBytes(6).toString('hex'),
        event.organizer_id,
        'Event Approved!',
        `Your event "${event.title}" has been approved by ${approver.name}. It is now discoverable to students.`
      );
    });

    updateTx();

    res.json({
      success: true,
      message: 'Event approved successfully!',
      status: newStatus
    });
  } catch (err: any) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Server error during event approval' });
  }
});

// Reject an event
approvalsRouter.post('/:eventId/reject', authenticateToken, requireRole('approver', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { eventId } = req.params;
    const { reason, comments } = req.body;
    const approver = req.user!;

    if (!reason || reason.trim() === '') {
      res.status(400).json({ error: 'A rejection reason is mandatory when rejecting an event.' });
      return;
    }

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as any;
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const previousStatus = event.status;
    const newStatus = 'REJECTED';
    const historyId = 'appr_' + crypto.randomBytes(6).toString('hex');
    const combinedReason = reason.trim() + (comments ? ` (Notes: ${comments})` : '');

    const rejectTx = db.transaction(() => {
      db.prepare(`UPDATE events SET status = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newStatus, combinedReason, eventId);
      db.prepare(`
        INSERT INTO approvals_history (id, event_id, approver_id, approver_name, previous_status, new_status, action, comments)
        VALUES (?, ?, ?, ?, ?, ?, 'REJECTED', ?)
      `).run(historyId, eventId, approver.id, approver.name, previousStatus, newStatus, combinedReason);

      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type)
        VALUES (?, ?, ?, ?, 'approval')
      `).run(
        'notif_' + crypto.randomBytes(6).toString('hex'),
        event.organizer_id,
        'Event Submission Needs Revision',
        `Your event "${event.title}" was not approved. Reason: ${combinedReason}. You can edit and resubmit.`
      );
    });

    rejectTx();

    res.json({
      success: true,
      message: 'Event marked as rejected. Feedback logged for organizer.',
      status: newStatus
    });
  } catch (err: any) {
    console.error('Rejection error:', err);
    res.status(500).json({ error: 'Server error during event rejection' });
  }
});
