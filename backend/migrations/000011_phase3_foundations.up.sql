ALTER TABLE users
  ADD COLUMN role VARCHAR(24) NOT NULL DEFAULT 'reader' AFTER password_hash,
  ADD COLUMN reminder_timezone VARCHAR(64) NOT NULL DEFAULT 'UTC' AFTER reminder_frequency;

CREATE TABLE audit_events (
  id CHAR(36) PRIMARY KEY,
  actor_user_id CHAR(36) NOT NULL,
  actor_role VARCHAR(24) NOT NULL,
  action VARCHAR(80) NOT NULL,
  resource_type VARCHAR(40) NOT NULL,
  resource_id CHAR(36) NULL,
  metadata JSON NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_audit_actor_created (actor_user_id, created_at),
  INDEX idx_audit_action_created (action, created_at)
);

CREATE TABLE reminder_deliveries (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  channel VARCHAR(24) NOT NULL,
  scheduled_for DATETIME(3) NOT NULL,
  status VARCHAR(24) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  last_error VARCHAR(255) NULL,
  next_attempt_at DATETIME(3) NULL,
  sent_at DATETIME(3) NULL,
  idempotency_key VARCHAR(191) NOT NULL,
  payload JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_reminder_deliveries_key (idempotency_key),
  INDEX idx_reminder_deliveries_dispatch (status, next_attempt_at, scheduled_for),
  INDEX idx_reminder_deliveries_user (user_id, created_at)
);

CREATE INDEX idx_users_reminder_schedule ON users (reminder_enabled, reminder_time, reminder_frequency, reminder_timezone);
CREATE INDEX idx_books_user_status_updated ON books (user_id, status, updated_at);
CREATE INDEX idx_reading_sessions_user_date ON reading_sessions (user_id, date);
