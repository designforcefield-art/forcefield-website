-- Analytics events for the All Solutions page (already created automatically by
-- functions/api/_db.js since Build 77). Safe to run on an existing database.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  day TEXT NOT NULL,
  sid TEXT,
  event TEXT NOT NULL,
  value TEXT NOT NULL,
  page TEXT,
  industry TEXT,
  goal TEXT,
  category TEXT
);
CREATE INDEX IF NOT EXISTS events_day ON events(day);
CREATE INDEX IF NOT EXISTS events_event ON events(event, value);
