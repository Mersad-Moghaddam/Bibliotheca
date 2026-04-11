ALTER TABLE books
  ADD COLUMN cover_url VARCHAR(500) NULL,
  ADD COLUMN genre VARCHAR(120) NULL,
  ADD COLUMN isbn VARCHAR(40) NULL;

CREATE TABLE reading_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  book_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  duration INT NOT NULL,
  pages_read INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_reading_sessions_user_id (user_id),
  INDEX idx_reading_sessions_book_id (book_id),
  INDEX idx_reading_sessions_date (date),
  CONSTRAINT fk_reading_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reading_sessions_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE reading_goals (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  period VARCHAR(20) NOT NULL,
  pages_goal INT NOT NULL DEFAULT 0,
  books_goal INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_reading_goals_user_period (user_id, period),
  INDEX idx_reading_goals_user_id (user_id),
  CONSTRAINT fk_reading_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE book_notes (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  book_id CHAR(36) NOT NULL,
  note TEXT NOT NULL,
  highlight TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_book_notes_user_id (user_id),
  INDEX idx_book_notes_book_id (book_id),
  CONSTRAINT fk_book_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_book_notes_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
