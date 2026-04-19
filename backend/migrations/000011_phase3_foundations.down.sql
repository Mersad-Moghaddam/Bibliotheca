DROP INDEX idx_reading_sessions_user_date ON reading_sessions;
DROP INDEX idx_books_user_status_updated ON books;
DROP INDEX idx_users_reminder_schedule ON users;

DROP TABLE reminder_deliveries;
DROP TABLE audit_events;

ALTER TABLE users
  DROP COLUMN reminder_timezone,
  DROP COLUMN role;
