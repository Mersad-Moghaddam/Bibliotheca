-- Align schema with runtime domain constraints and query patterns.

ALTER TABLE users
  MODIFY name VARCHAR(120) NOT NULL,
  MODIFY email VARCHAR(160) NOT NULL,
  MODIFY password_hash VARCHAR(255) NOT NULL,
  MODIFY role VARCHAR(24) NOT NULL DEFAULT 'reader',
  MODIFY reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  MODIFY reminder_time VARCHAR(5) NOT NULL DEFAULT '20:00',
  MODIFY reminder_frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
  MODIFY reminder_timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  ADD CONSTRAINT chk_users_role CHECK (role IN ('reader', 'admin')),
  ADD CONSTRAINT chk_users_reminder_frequency CHECK (reminder_frequency IN ('daily', 'weekly', 'weekdays'));

ALTER TABLE books
  MODIFY title VARCHAR(200) NOT NULL,
  MODIFY author VARCHAR(200) NOT NULL,
  MODIFY total_pages INT UNSIGNED NOT NULL,
  MODIFY status VARCHAR(30) NOT NULL,
  MODIFY current_page INT UNSIGNED NULL,
  MODIFY cover_url VARCHAR(500) NULL,
  MODIFY genre VARCHAR(120) NULL,
  MODIFY isbn VARCHAR(40) NULL,
  MODIFY finish_rating TINYINT UNSIGNED NULL,
  MODIFY next_to_read_focus BOOLEAN NOT NULL DEFAULT FALSE,
  MODIFY next_to_read_note VARCHAR(240) NULL,
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  ADD CONSTRAINT chk_books_status CHECK (status IN ('inLibrary', 'currentlyReading', 'finished', 'nextToRead')),
  ADD CONSTRAINT chk_books_pages CHECK (current_page IS NULL OR current_page <= total_pages),
  ADD CONSTRAINT chk_books_finish_rating CHECK (finish_rating IS NULL OR (finish_rating >= 1 AND finish_rating <= 5));

CREATE INDEX idx_books_user_updated ON books (user_id, updated_at);
CREATE INDEX idx_books_user_created ON books (user_id, created_at);
CREATE INDEX idx_books_user_book_lookup ON books (user_id, id);

ALTER TABLE wishlist
  MODIFY title VARCHAR(200) NOT NULL,
  MODIFY author VARCHAR(200) NOT NULL,
  MODIFY expected_price DECIMAL(10,2) UNSIGNED NULL,
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

ALTER TABLE purchase_links
  MODIFY label VARCHAR(120) NOT NULL,
  MODIFY alias VARCHAR(120) NOT NULL,
  MODIFY url VARCHAR(500) NOT NULL,
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

CREATE INDEX idx_wishlist_user_updated ON wishlist (user_id, updated_at);
CREATE INDEX idx_purchase_links_wishlist_created ON purchase_links (wishlist_id, created_at);

UPDATE reading_goals
SET source = 'manual'
WHERE source IS NULL OR source = '';

UPDATE reading_goals
SET start_date = CASE
  WHEN period = 'weekly' THEN DATE_SUB(DATE(created_at), INTERVAL ((DAYOFWEEK(created_at) + 5) % 7) DAY)
  WHEN period = 'monthly' THEN DATE_SUB(DATE(created_at), INTERVAL DAYOFMONTH(created_at) - 1 DAY)
  ELSE DATE(created_at)
END
WHERE start_date IS NULL;

UPDATE reading_goals
SET end_date = CASE
  WHEN period = 'weekly' THEN DATE_ADD(start_date, INTERVAL 6 DAY)
  WHEN period = 'monthly' THEN LAST_DAY(start_date)
  ELSE start_date
END
WHERE end_date IS NULL;

ALTER TABLE reading_goals
  MODIFY period VARCHAR(20) NOT NULL,
  MODIFY pages_goal INT UNSIGNED NULL,
  MODIFY books_goal INT UNSIGNED NULL,
  MODIFY source VARCHAR(32) NOT NULL DEFAULT 'manual',
  MODIFY start_date DATE NOT NULL,
  MODIFY end_date DATE NOT NULL,
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  ADD CONSTRAINT chk_reading_goals_period CHECK (period IN ('weekly', 'monthly')),
  ADD CONSTRAINT chk_reading_goals_source CHECK (source IN ('manual', 'suggested', 'applied_suggestion')),
  ADD CONSTRAINT chk_reading_goals_target CHECK (pages_goal IS NOT NULL OR books_goal IS NOT NULL),
  ADD CONSTRAINT chk_reading_goals_window CHECK (start_date <= end_date);

CREATE INDEX idx_reading_goals_user_period_dates ON reading_goals (user_id, period, start_date, end_date);

ALTER TABLE reading_sessions
  MODIFY duration INT UNSIGNED NOT NULL,
  MODIFY pages_read INT UNSIGNED NOT NULL,
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  ADD CONSTRAINT chk_reading_sessions_duration CHECK (duration > 0),
  ADD CONSTRAINT chk_reading_sessions_pages_read CHECK (pages_read >= 0);

CREATE INDEX idx_reading_sessions_user_book_date ON reading_sessions (user_id, book_id, date);

ALTER TABLE reading_events
  MODIFY event_type VARCHAR(32) NOT NULL,
  MODIFY pages_delta INT NOT NULL DEFAULT 0,
  MODIFY completed_delta INT NOT NULL DEFAULT 0,
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD CONSTRAINT chk_reading_events_type CHECK (event_type IN ('progress_update', 'book_completed', 'completion_reverted', 'progress_corrected'));

CREATE INDEX idx_reading_events_user_date_created ON reading_events (user_id, event_date, created_at);

ALTER TABLE book_notes
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

CREATE INDEX idx_book_notes_user_book_created ON book_notes (user_id, book_id, created_at);

ALTER TABLE reminder_deliveries
  MODIFY channel VARCHAR(24) NOT NULL,
  MODIFY status VARCHAR(24) NOT NULL,
  MODIFY attempts INT UNSIGNED NOT NULL DEFAULT 0,
  MODIFY last_error VARCHAR(255) NULL,
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  ADD CONSTRAINT fk_reminder_deliveries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT chk_reminder_deliveries_channel CHECK (channel IN ('in_app')),
  ADD CONSTRAINT chk_reminder_deliveries_status CHECK (status IN ('pending', 'processing', 'sent', 'failed'));

ALTER TABLE audit_events
  MODIFY actor_role VARCHAR(24) NOT NULL,
  MODIFY action VARCHAR(80) NOT NULL,
  MODIFY resource_type VARCHAR(40) NOT NULL,
  MODIFY ip_address VARCHAR(64) NULL,
  MODIFY user_agent VARCHAR(255) NULL,
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
