DROP TABLE IF EXISTS book_notes;
DROP TABLE IF EXISTS reading_goals;
DROP TABLE IF EXISTS reading_sessions;

ALTER TABLE books
  DROP COLUMN isbn,
  DROP COLUMN genre,
  DROP COLUMN cover_url;
