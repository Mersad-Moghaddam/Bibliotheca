ALTER TABLE reading_goals
  DROP INDEX uq_reading_goals_user_period_window,
  ADD UNIQUE KEY uq_reading_goals_user_period (user_id, period);

ALTER TABLE reading_goals
  DROP COLUMN end_date,
  DROP COLUMN start_date,
  DROP COLUMN source,
  MODIFY pages_goal INT NOT NULL DEFAULT 0,
  MODIFY books_goal INT NOT NULL DEFAULT 0;
