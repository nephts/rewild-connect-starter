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

-- global chat messages
CREATE TABLE IF NOT EXISTS global_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- seed default access codes
INSERT OR IGNORE INTO access_codes(code, role, active) VALUES
  ('VIEW-123', 'Viewer', 1),
  ('VOL-123', 'Volunteer', 1),
  ('INT-123', 'Intern', 1),
  ('ADMIN-123', 'Admin', 1);

