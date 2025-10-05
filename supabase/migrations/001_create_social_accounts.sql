-- Create social_accounts table
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    access_token TEXT NOT NULL,
    access_token_iv TEXT NOT NULL,
    access_token_tag TEXT NOT NULL,
    refresh_token TEXT,
    refresh_token_iv TEXT,
    refresh_token_tag TEXT,
    token_expiry TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    last_synced TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, platform)
);

-- Add RLS policies
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own social accounts
CREATE POLICY "Users can view own social accounts" ON public.social_accounts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own social accounts
CREATE POLICY "Users can insert own social accounts" ON public.social_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own social accounts
CREATE POLICY "Users can update own social accounts" ON public.social_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own social accounts
CREATE POLICY "Users can delete own social accounts" ON public.social_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE
    ON public.social_accounts FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();