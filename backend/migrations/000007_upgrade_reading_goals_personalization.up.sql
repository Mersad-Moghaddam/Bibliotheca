ALTER TABLE reading_goals
  MODIFY pages_goal INT NULL,
  MODIFY books_goal INT NULL,
  ADD COLUMN source VARCHAR(32) NOT NULL DEFAULT 'manual' AFTER books_goal,
  ADD COLUMN start_date DATE NULL AFTER source,
  ADD COLUMN end_date DATE NULL AFTER start_date;

ALTER TABLE reading_goals
  DROP INDEX uq_reading_goals_user_period,
  ADD UNIQUE KEY uq_reading_goals_user_period_window (user_id, period, start_date, end_date);
