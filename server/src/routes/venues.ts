import { Router } from 'express';
import { db } from '../db/database.js';
import { checkVenueConflict } from '../utils/conflictChecker.js';

export const venuesRouter = Router();

// Get all venues
venuesRouter.get('/', (_req, res): void => {
  try {
    const venues = db.prepare('SELECT * FROM venues WHERE is_active = 1 ORDER BY name ASC').all();
    res.json({ venues });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// Check venue conflict
venuesRouter.post('/check-conflict', (req, res): void => {
  try {
    const { venueId, eventDate, startTime, endTime, excludeEventId } = req.body;

    if (!venueId || !eventDate || !startTime || !endTime) {
      res.status(400).json({ error: 'venueId, eventDate, startTime, and endTime are required' });
      return;
    }

    if (endTime <= startTime) {
      res.status(400).json({ error: 'End time must be after start time' });
      return;
    }

    const conflictResult = checkVenueConflict(venueId, eventDate, startTime, endTime, excludeEventId);
    res.json(conflictResult);
  } catch (err: any) {
    console.error('Error checking conflict:', err);
    res.status(500).json({ error: 'Failed to check venue conflict' });
  }
});
