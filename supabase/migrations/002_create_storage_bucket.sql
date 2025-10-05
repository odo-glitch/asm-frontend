-- Create storage bucket for content library
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'content-library',
    'content-library', 
    true, -- Public bucket for easier access (you can change to false and use RLS)
    52428800, -- 50MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mpeg', 'application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
CREATE POLICY "Users can upload their own content"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'content-library' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own content"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'content-library' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own content" 
ON storage.objects FOR DELETE
USING (
    bucket_id = 'content-library' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view content if bucket is public"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-library');