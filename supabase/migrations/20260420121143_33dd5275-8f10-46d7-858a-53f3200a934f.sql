-- Create public storage bucket for hospital images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hospital-images', 'hospital-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Hospital images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'hospital-images');

-- Admins can upload
CREATE POLICY "Admins can upload hospital images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hospital-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update
CREATE POLICY "Admins can update hospital images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hospital-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete hospital images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hospital-images' AND public.has_role(auth.uid(), 'admin'));