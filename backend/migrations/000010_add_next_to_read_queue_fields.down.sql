DROP INDEX idx_books_user_next_focus ON books;

ALTER TABLE books
    DROP COLUMN next_to_read_note,
    DROP COLUMN next_to_read_focus;
