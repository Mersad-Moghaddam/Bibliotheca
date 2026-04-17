ALTER TABLE books
    ADD COLUMN next_to_read_focus BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN next_to_read_note VARCHAR(240) NULL;

CREATE INDEX idx_books_user_next_focus ON books (user_id, next_to_read_focus, updated_at);
