import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Register new user
authRouter.post('/register', (req, res): void => {
  try {
    const { email, password, name, role = 'student', department = '', organization = '', interests = [] } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const id = 'usr_' + crypto.randomBytes(8).toString('hex');

    const interestsJson = JSON.stringify(interests || []);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, department, organization, interests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, email.toLowerCase(), password_hash, name, role, department, organization, interestsJson);

    const user = {
      id,
      email: email.toLowerCase(),
      name,
      role: role as any,
      department,
      organization,
      interests: interests || []
    };

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      user,
      token
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
authRouter.post('/login', (req, res): void => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const userRecord = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
    if (!userRecord) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const validPassword = bcrypt.compareSync(password, userRecord.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    let interests: string[] = [];
    try {
      interests = JSON.parse(userRecord.interests || '[]');
    } catch (e) {
      interests = [];
    }

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      department: userRecord.department,
      organization: userRecord.organization,
      interests
    };

    const token = generateToken(user);

    res.json({
      message: 'Logged in successfully',
      user,
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Current User Profile
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userRecord = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!userRecord) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let interests: string[] = [];
    try {
      interests = JSON.parse(userRecord.interests || '[]');
    } catch (e) {
      interests = [];
    }

    res.json({
      user: {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        role: userRecord.role,
        department: userRecord.department,
        organization: userRecord.organization,
        interests
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update Interests
authRouter.patch('/interests', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { interests } = req.body;
    if (!Array.isArray(interests)) {
      res.status(400).json({ error: 'Interests must be an array of strings' });
      return;
    }

    db.prepare('UPDATE users SET interests = ? WHERE id = ?').run(JSON.stringify(interests), req.user!.id);
    res.json({ success: true, interests });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update interests' });
  }
});

// Demo accounts metadata for instant hackathon demonstration
authRouter.get('/demo-accounts', (_req, res): void => {
  res.json({
    accounts: [
      {
        role: 'student',
        label: 'Alex Rivera (Student)',
        email: 'alex.student@campus.edu',
        password: 'password123',
        description: 'Explore events, register, receive QR tickets, view calendar'
      },
      {
        role: 'organizer',
        label: 'Maya Patel (Organizer)',
        email: 'maya.organizer@campus.edu',
        password: 'password123',
        description: 'Draft events, AI flyer upload, check venue conflicts, track registrations'
      },
      {
        role: 'approver',
        label: 'Dean Marcus Vance (Approver)',
        email: 'dean.approver@campus.edu',
        password: 'password123',
        description: 'Review pending submissions, check conflicts, approve/reject with feedback'
      },
      {
        role: 'admin',
        label: 'Campus Admin (Administrator)',
        email: 'admin@campus.edu',
        password: 'password123',
        description: 'Full campus control, analytics, approvals, and universal check-in'
      }
    ]
  });
});
