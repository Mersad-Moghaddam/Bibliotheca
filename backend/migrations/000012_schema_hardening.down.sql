ALTER TABLE reminder_deliveries
  DROP FOREIGN KEY fk_reminder_deliveries_user,
  DROP CHECK chk_reminder_deliveries_channel,
  DROP CHECK chk_reminder_deliveries_status,
  MODIFY attempts INT NOT NULL DEFAULT 0;

DROP INDEX idx_book_notes_user_book_created ON book_notes;

ALTER TABLE reading_events
  DROP CHECK chk_reading_events_type;

DROP INDEX idx_reading_events_user_date_created ON reading_events;

ALTER TABLE reading_sessions
  DROP CHECK chk_reading_sessions_duration,
  DROP CHECK chk_reading_sessions_pages_read,
  MODIFY duration INT NOT NULL,
  MODIFY pages_read INT NOT NULL;

DROP INDEX idx_reading_sessions_user_book_date ON reading_sessions;
DROP INDEX idx_reading_goals_user_period_dates ON reading_goals;

ALTER TABLE reading_goals
  DROP CHECK chk_reading_goals_period,
  DROP CHECK chk_reading_goals_source,
  DROP CHECK chk_reading_goals_target,
  DROP CHECK chk_reading_goals_window,
  MODIFY pages_goal INT NULL,
  MODIFY books_goal INT NULL,
  MODIFY start_date DATE NULL,
  MODIFY end_date DATE NULL;

DROP INDEX idx_purchase_links_wishlist_created ON purchase_links;
DROP INDEX idx_wishlist_user_updated ON wishlist;
DROP INDEX idx_books_user_book_lookup ON books;
DROP INDEX idx_books_user_created ON books;
DROP INDEX idx_books_user_updated ON books;

ALTER TABLE books
  DROP CHECK chk_books_status,
  DROP CHECK chk_books_pages,
  DROP CHECK chk_books_finish_rating,
  MODIFY total_pages INT NOT NULL,
  MODIFY current_page INT NULL,
  MODIFY finish_rating INT NULL;

ALTER TABLE users
  DROP CHECK chk_users_role,
  DROP CHECK chk_users_reminder_frequency,
  MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
