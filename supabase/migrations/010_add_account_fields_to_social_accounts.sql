-- Add account_name and account_id columns to social_accounts table
ALTER TABLE social_accounts
ADD COLUMN IF NOT EXISTS account_name TEXT,
ADD COLUMN IF NOT EXISTS account_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_accounts_account_id ON social_accounts(account_id);
