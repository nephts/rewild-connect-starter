-- users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,                 -- null for OAuth users
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'Pending',  -- Pending, Viewer, Volunteer, Intern, Admin, SuperAdmin
  created_at INTEGER NOT NULL
);

-- access codes to roles (so you can rotate codes later)
CREATE TABLE IF NOT EXISTS access_codes (
  code TEXT PRIMARY KEY,
  role TEXT NOT NULL,                  -- Viewer/Volunteer/Intern/Admin
  active INTEGER NOT NULL DEFAULT 1
);

-- announcements
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);

-- messages (global chat)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- photos (simple record of uploaded/hosted photos)
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- shifts (events/shift slots)
CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_ts INTEGER NOT NULL,
  end_ts INTEGER,
  capacity INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);

-- shift signups
CREATE TABLE IF NOT EXISTS shift_signups (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- seed default access codes
INSERT OR IGNORE INTO access_codes(code, role, active) VALUES
  ('VIEW-123', 'Viewer', 1),
  ('VOL-123', 'Volunteer', 1),
  ('INT-123', 'Intern', 1),
  ('ADMIN-123', 'Admin', 1);

