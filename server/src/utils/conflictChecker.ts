import { db } from '../db/database.js';

export interface ConflictResult {
  hasConflict: boolean;
  conflictingEvents: Array<{
    id: string;
    title: string;
    organizerClub: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  suggestedSlots: Array<{ startTime: string; endTime: string; label: string }>;
  suggestedVenues: Array<{ id: string; name: string; capacity: number; location: string }>;
}

export function checkVenueConflict(
  venueId: string,
  eventDate: string,
  startTime: string,
  endTime: string,
  excludeEventId?: string
): ConflictResult {
  // Query all active events at this venue on this date
  const activeStatuses = ['PENDING_APPROVAL', 'APPROVED', 'PUBLISHED'];
  const placeholders = activeStatuses.map(() => '?').join(',');
  
  let sql = `
    SELECT id, title, organizer_club as organizerClub, start_time as startTime, end_time as endTime, status
    FROM events
    WHERE venue_id = ? 
      AND event_date = ?
      AND status IN (${placeholders})
  `;
  const params: any[] = [venueId, eventDate, ...activeStatuses];

  if (excludeEventId) {
    sql += ` AND id != ?`;
    params.push(excludeEventId);
  }

  const existingEvents = db.prepare(sql).all(...params) as Array<{
    id: string;
    title: string;
    organizerClub: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;

  // Find strictly overlapping events: StartA < EndB AND EndA > StartB
  const conflictingEvents = existingEvents.filter(ev => {
    return ev.startTime < endTime && ev.endTime > startTime;
  });

  if (conflictingEvents.length === 0) {
    return {
      hasConflict: false,
      conflictingEvents: [],
      suggestedSlots: [],
      suggestedVenues: []
    };
  }

  // Generate suggested alternate time slots for this venue
  const standardSlots = [
    { startTime: '08:30', endTime: '11:00', label: 'Morning Slot (08:30 - 11:00)' },
    { startTime: '11:30', endTime: '14:00', label: 'Mid-Day Slot (11:30 - 14:00)' },
    { startTime: '14:30', endTime: '17:00', label: 'Afternoon Slot (14:30 - 17:00)' },
    { startTime: '17:30', endTime: '20:30', label: 'Evening Slot (17:30 - 20:30)' }
  ];

  const suggestedSlots = standardSlots.filter(slot => {
    // Check if slot overlaps with any active event
    return !existingEvents.some(ev => ev.startTime < slot.endTime && ev.endTime > slot.startTime);
  });

  // Suggest alternate available venues that have NO conflict during the requested time
  const allVenues = db.prepare(`SELECT id, name, capacity, location_details as location FROM venues WHERE is_active = 1 AND id != ?`).all(venueId) as Array<{
    id: string;
    name: string;
    capacity: number;
    location: string;
  }>;

  const suggestedVenues = allVenues.filter(venue => {
    let venueSql = `
      SELECT COUNT(*) as cnt
      FROM events
      WHERE venue_id = ?
        AND event_date = ?
        AND status IN (${placeholders})
        AND start_time < ? AND end_time > ?
    `;
    const checkParams: any[] = [venue.id, eventDate, ...activeStatuses, endTime, startTime];
    if (excludeEventId) {
      venueSql += ` AND id != ?`;
      checkParams.push(excludeEventId);
    }
    const res = db.prepare(venueSql).get(...checkParams) as { cnt: number };
    return res.cnt === 0;
  });

  return {
    hasConflict: true,
    conflictingEvents,
    suggestedSlots,
    suggestedVenues
  };
}
