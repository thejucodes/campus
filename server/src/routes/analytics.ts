import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const analyticsRouter = Router();

// Organizer Dashboard Stats
analyticsRouter.get('/organizer', authenticateToken, requireRole('organizer', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const isGlobalAdmin = req.user!.role === 'admin';
    const viewAll = isGlobalAdmin && req.query.viewAll === 'true';

    // Counts
    let eventsCountSql = `SELECT COUNT(*) as count FROM events`;
    let pendingCountSql = `SELECT COUNT(*) as count FROM events WHERE status = 'PENDING_APPROVAL'`;
    let approvedUpcomingSql = `SELECT COUNT(*) as count FROM events WHERE status IN ('APPROVED', 'PUBLISHED') AND event_date >= date('now')`;
    let regStatsSql = `
      SELECT 
        COUNT(r.id) as total_registrations,
        SUM(CASE WHEN r.status = 'CHECKED_IN' THEN 1 ELSE 0 END) as total_checked_in
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.status != 'CANCELLED'
    `;
    let categorySql = `SELECT category, COUNT(*) as count FROM events GROUP BY category ORDER BY count DESC`;
    let recentEventsSql = `
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status != 'CANCELLED') as registered_count,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CHECKED_IN') as checked_in_count
      FROM events e
      ORDER BY e.created_at DESC
      LIMIT 10
    `;
    let trendsSql = `
      SELECT 
        date(r.registered_at) as date,
        COUNT(r.id) as count
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.status != 'CANCELLED'
      GROUP BY date(r.registered_at)
      ORDER BY date ASC
      LIMIT 14
    `;

    let eventsCount: { count: number };
    let pendingCount: { count: number };
    let approvedUpcoming: { count: number };
    let regStats: { total_registrations: number; total_checked_in: number };
    let categoryBreakdown: any[];
    let recentEvents: any[];
    let registrationTrends: any[];

    if (!viewAll) {
      eventsCountSql = `SELECT COUNT(*) as count FROM events WHERE organizer_id = ?`;
      pendingCountSql = `SELECT COUNT(*) as count FROM events WHERE organizer_id = ? AND status = 'PENDING_APPROVAL'`;
      approvedUpcomingSql = `SELECT COUNT(*) as count FROM events WHERE organizer_id = ? AND status IN ('APPROVED', 'PUBLISHED') AND event_date >= date('now')`;
      regStatsSql = `
        SELECT 
          COUNT(r.id) as total_registrations,
          SUM(CASE WHEN r.status = 'CHECKED_IN' THEN 1 ELSE 0 END) as total_checked_in
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE e.organizer_id = ? AND r.status != 'CANCELLED'
      `;
      categorySql = `SELECT category, COUNT(*) as count FROM events WHERE organizer_id = ? GROUP BY category ORDER BY count DESC`;
      recentEventsSql = `
        SELECT 
          e.*,
          (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status != 'CANCELLED') as registered_count,
          (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CHECKED_IN') as checked_in_count
        FROM events e
        WHERE e.organizer_id = ?
        ORDER BY e.created_at DESC
        LIMIT 10
      `;
      trendsSql = `
        SELECT 
          date(r.registered_at) as date,
          COUNT(r.id) as count
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE e.organizer_id = ? AND r.status != 'CANCELLED'
        GROUP BY date(r.registered_at)
        ORDER BY date ASC
        LIMIT 14
      `;

      eventsCount = db.prepare(eventsCountSql).get(userId) as { count: number };
      pendingCount = db.prepare(pendingCountSql).get(userId) as { count: number };
      approvedUpcoming = db.prepare(approvedUpcomingSql).get(userId) as { count: number };
      regStats = db.prepare(regStatsSql).get(userId) as { total_registrations: number; total_checked_in: number };
      categoryBreakdown = db.prepare(categorySql).all(userId);
      recentEvents = db.prepare(recentEventsSql).all(userId);
      registrationTrends = db.prepare(trendsSql).all(userId);
    } else {
      eventsCount = db.prepare(eventsCountSql).get() as { count: number };
      pendingCount = db.prepare(pendingCountSql).get() as { count: number };
      approvedUpcoming = db.prepare(approvedUpcomingSql).get() as { count: number };
      regStats = db.prepare(regStatsSql).get() as { total_registrations: number; total_checked_in: number };
      categoryBreakdown = db.prepare(categorySql).all();
      recentEvents = db.prepare(recentEventsSql).all();
      registrationTrends = db.prepare(trendsSql).all();
    }

    const totalReg = regStats?.total_registrations || 0;
    const totalChecked = regStats?.total_checked_in || 0;
    const attendanceRate = totalReg > 0 ? Math.round((totalChecked / totalReg) * 100) : 0;

    res.json({
      metrics: {
        totalEvents: eventsCount?.count || 0,
        pendingApproval: pendingCount?.count || 0,
        approvedUpcoming: approvedUpcoming?.count || 0,
        totalRegistrations: totalReg,
        totalCheckedIn: totalChecked,
        attendanceRate
      },
      categoryBreakdown,
      recentEvents,
      registrationTrends
    });
  } catch (err: any) {
    console.error('Organizer analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch organizer analytics' });
  }
});

// Admin System-wide Dashboard
analyticsRouter.get('/admin', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const userStats = db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) as organizers,
        SUM(CASE WHEN role = 'approver' THEN 1 ELSE 0 END) as approvers
      FROM users
    `).get() as any;

    const eventStats = db.prepare(`
      SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN status = 'PENDING_APPROVAL' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status IN ('APPROVED', 'PUBLISHED') THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
      FROM events
    `).get() as any;

    const regStats = db.prepare(`
      SELECT 
        COUNT(*) as total_registrations,
        SUM(CASE WHEN status = 'CHECKED_IN' THEN 1 ELSE 0 END) as checked_in,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
      FROM registrations
    `).get() as any;

    const venuesUtilization = db.prepare(`
      SELECT 
        v.name,
        v.capacity,
        COUNT(e.id) as bookings_count
      FROM venues v
      LEFT JOIN events e ON v.id = e.venue_id AND e.status IN ('APPROVED', 'PUBLISHED')
      GROUP BY v.id
      ORDER BY bookings_count DESC
    `).all();

    res.json({
      userStats,
      eventStats,
      regStats,
      venuesUtilization
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
});

// User Notifications
analyticsRouter.get('/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const notifs = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `).all(req.user!.id);

    const unreadCount = db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`).get(req.user!.id) as { count: number };

    res.json({
      notifications: notifs,
      unreadCount: unreadCount.count
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification read
analyticsRouter.post('/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});
