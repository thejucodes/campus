import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initDatabase } from './db/database.js';
import { authRouter } from './routes/auth.js';
import { venuesRouter } from './routes/venues.js';
import { eventsRouter } from './routes/events.js';
import { registrationsRouter } from './routes/registrations.js';
import { approvalsRouter } from './routes/approvals.js';
import { checkinRouter } from './routes/checkin.js';
import { aiRouter } from './routes/ai.js';
import { analyticsRouter } from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema
initDatabase();

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'CampusPulse API Server',
    event: "SYNESIS '26",
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/venues', venuesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[CampusPulse Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`[CampusPulse] Server running on port ${PORT}`);
  console.log(`[CampusPulse] Health check: http://localhost:${PORT}/api/health`);
});
