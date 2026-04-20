UPDATE users
SET email = CONCAT('rollback-', REPLACE(id, '-', ''), '@mobile.negar.local')
WHERE email IS NULL;

ALTER TABLE users
  MODIFY COLUMN email VARCHAR(160) NOT NULL,
  DROP INDEX idx_users_mobile_number,
  DROP COLUMN mobile_number;
