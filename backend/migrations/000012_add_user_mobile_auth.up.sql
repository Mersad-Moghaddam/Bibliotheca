ALTER TABLE users
  ADD COLUMN mobile_number VARCHAR(20) NULL AFTER name,
  MODIFY COLUMN email VARCHAR(160) NULL,
  ADD UNIQUE INDEX idx_users_mobile_number (mobile_number);
