-- +goose Up
-- +goose StatementBegin
ALTER TABLE users 
  ALTER COLUMN bio TYPE TEXT,
  ALTER COLUMN bio SET DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Revert to the previous state of the bio column here (example below)
ALTER TABLE users 
  ALTER COLUMN bio DROP DEFAULT,
  ALTER COLUMN bio SET NOT NULL; 
-- +goose StatementEnd