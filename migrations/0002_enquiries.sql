-- Enquiries from the Get Started (sign-up) and General Enquiry forms,
-- plus admin sign-in attempts (for brute-force protection). Additive only.
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,            -- e.g. FF-7K2Q9M, shown to the customer
  idempotency_key TEXT NOT NULL UNIQUE,      -- from the browser; retries reuse it, so no duplicates
  form TEXT NOT NULL,                        -- 'get-started' | 'general'
  enquiry_type TEXT NOT NULL,                -- 'Sign up' or the General Enquiry type chosen
  service TEXT,                              -- discovery | essential | dynamic (Get Started only)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT,                              -- General Enquiry message or Get Started business brief
  shared_link TEXT,                          -- stored as text only; never fetched by the site
  details_json TEXT,                         -- My Pick, selected solutions, recommendation, service source
  attachments_json TEXT,                     -- file names/sizes only (files go in the email, not the database)
  consent_text TEXT NOT NULL,
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'in_progress', 'closed')),
  email_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'failed')),
  email_attempts INTEGER NOT NULL DEFAULT 0,
  email_error TEXT,                          -- short reason only, no credentials
  email_id TEXT,                             -- Resend message id
  ip_hash TEXT,                              -- salted SHA-256, for rate limiting; not the IP itself
  content_hash TEXT,                         -- for catching repeat submissions
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS enquiries_created ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS enquiries_email_status ON enquiries(email_status);
CREATE INDEX IF NOT EXISTS enquiries_ip ON enquiries(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS enquiries_dupe ON enquiries(email, content_hash, created_at);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  ok INTEGER NOT NULL,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_login_ip ON admin_login_attempts(ip_hash, ts);
