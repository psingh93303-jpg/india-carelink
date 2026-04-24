DROP POLICY IF EXISTS "Hospital images readable by authenticated" ON storage.objects;

CREATE POLICY "Hospital images readable by direct path"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'hospital-images'
  AND name IS NOT NULL
);