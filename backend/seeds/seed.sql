-- Demo seed data for local and portfolio environments.
-- Password hash corresponds to password: DemoPass123!

INSERT INTO users (id, name, email, password_hash, role, reminder_enabled, reminder_time, reminder_frequency, reminder_timezone, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo Reader', 'demo@negar.app', '$2a$10$2fV9u5hQK3z2xKHY7rbTXuN8lzwgwoRS6mjlxF7LvWNxJxV4fB75e', 'reader', 1, '20:30', 'daily', 'UTC', NOW(3), NOW(3));

INSERT INTO books (id, user_id, title, author, total_pages, status, current_page, cover_url, genre, isbn, completed_at, finish_rating, finish_reflection, finish_highlight, next_to_read_focus, next_to_read_note, created_at, updated_at)
VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Atomic Habits', 'James Clear', 320, 'finished', 320, NULL, 'Self-help', '9780735211292', NOW(3), 5, 'Identity-based habits are easier to sustain.', 'Small daily wins compound quickly.', 0, NULL, NOW(3), NOW(3)),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'The Pragmatic Programmer', 'David Thomas', 352, 'currentlyReading', 146, NULL, 'Technology', '9780135957059', NULL, NULL, NULL, NULL, 0, NULL, NOW(3), NOW(3)),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Deep Work', 'Cal Newport', 304, 'nextToRead', NULL, NULL, 'Productivity', '9781455586691', NULL, NULL, NULL, NULL, 1, 'Read before morning standup.', NOW(3), NOW(3));

INSERT INTO wishlist (id, user_id, title, author, expected_price, notes, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Clean Architecture', 'Robert C. Martin', 28.99, 'Waiting for discount', NOW(3), NOW(3));

INSERT INTO purchase_links (id, wishlist_id, label, alias, url, created_at, updated_at)
VALUES
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'Amazon', 'Amazon US', 'https://www.amazon.com/', NOW(3), NOW(3));

INSERT INTO reading_goals (id, user_id, period, pages_goal, books_goal, source, start_date, end_date, created_at, updated_at)
VALUES
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'weekly', 180, 1, 'manual', DATE_SUB(CURDATE(), INTERVAL ((DAYOFWEEK(CURDATE()) + 5) % 7) DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL ((DAYOFWEEK(CURDATE()) + 5) % 7) DAY), INTERVAL 6 DAY), NOW(3), NOW(3)),
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'monthly', 720, 3, 'manual', DATE_SUB(CURDATE(), INTERVAL DAYOFMONTH(CURDATE()) - 1 DAY), LAST_DAY(CURDATE()), NOW(3), NOW(3));

INSERT INTO reading_sessions (id, user_id, book_id, date, duration, pages_read, created_at, updated_at)
VALUES
  ('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', CURDATE(), 30, 20, NOW(3), NOW(3)),
  ('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 25, 16, NOW(3), NOW(3));
