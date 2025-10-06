-- Create content_library table
CREATE TABLE IF NOT EXISTS content_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'video', 'document')),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  source VARCHAR(50) NOT NULL CHECK (source IN ('upload', 'canva', 'dropbox')),
  folder VARCHAR(100),
  tags TEXT[], -- Array of tags
  metadata JSONB, -- Store additional metadata like dimensions, duration, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content_folders table
CREATE TABLE IF NOT EXISTS content_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES content_folders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, parent_id)
);

-- Create indexes
CREATE INDEX idx_content_library_user ON content_library(user_id);
CREATE INDEX idx_content_library_type ON content_library(type);
CREATE INDEX idx_content_library_folder ON content_library(folder);
CREATE INDEX idx_content_library_tags ON content_library USING GIN(tags);
CREATE INDEX idx_content_folders_user ON content_folders(user_id);

-- Enable Row Level Security
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_folders ENABLE ROW LEVEL SECURITY;

-- Create policies for content_library
CREATE POLICY "Users can view their own content"
  ON content_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content"
  ON content_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
  ON content_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
  ON content_library FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for content_folders
CREATE POLICY "Users can manage their own folders"
  ON content_folders FOR ALL
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_content_library_updated_at BEFORE UPDATE
  ON content_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();