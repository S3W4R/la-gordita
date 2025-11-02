-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'files',
  'files',
  true,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed'
  ]
);

-- RLS Policies for files bucket
CREATE POLICY "Anyone can view files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'files');

CREATE POLICY "Admins can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);