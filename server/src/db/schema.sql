-- CampusPulse Database Schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student', 'organizer', 'approver', 'admin')),
  department TEXT DEFAULT '',
  organization TEXT DEFAULT '',
  interests TEXT DEFAULT '[]', -- JSON string array
  avatar TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  location_details TEXT NOT NULL,
  equipment TEXT NOT NULL,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  short_summary TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN (
    'Technical', 'Hackathons', 'Workshops', 'Cultural', 
    'Sports', 'Entrepreneurship', 'Art and Design', 'Clubs and Communities'
  )),
  event_date TEXT NOT NULL, -- YYYY-MM-DD
  start_time TEXT NOT NULL, -- HH:MM (24h)
  end_time TEXT NOT NULL,   -- HH:MM (24h)
  venue_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  expected_audience TEXT NOT NULL,
  max_capacity INTEGER NOT NULL,
  registration_deadline TEXT NOT NULL, -- ISO timestamp or YYYY-MM-DDTHH:MM
  eligibility TEXT NOT NULL,
  organizer_id TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_club TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  flyer_path TEXT DEFAULT '',
  additional_info TEXT DEFAULT '',
  status TEXT NOT NULL CHECK(status IN (
    'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'CANCELLED', 'COMPLETED'
  )) DEFAULT 'DRAFT',
  rejection_reason TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id),
  FOREIGN KEY (venue_id) REFERENCES venues(id)
);

CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY, -- Unique registration code e.g. "REG-CP-2026-X891"
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_department TEXT DEFAULT '',
  ticket_token TEXT UNIQUE NOT NULL, -- Secure token encoded in QR
  status TEXT NOT NULL CHECK(status IN ('REGISTERED', 'CHECKED_IN', 'CANCELLED')) DEFAULT 'REGISTERED',
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  checked_in_at DATETIME,
  checked_in_by TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS approvals_history (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  approver_id TEXT NOT NULL,
  approver_name TEXT NOT NULL,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  action TEXT NOT NULL,
  comments TEXT DEFAULT '',
  action_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
