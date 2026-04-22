
-- Restrict profile enumeration to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Public RPC to fetch display names only for users who have approved reviews
-- This lets anonymous viewers see reviewer names without exposing the full profiles table
CREATE OR REPLACE FUNCTION public.get_reviewer_names(_user_ids uuid[])
RETURNS TABLE(user_id uuid, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.user_id, p.display_name
  FROM public.profiles p
  WHERE p.user_id = ANY(_user_ids)
    AND EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.user_id = p.user_id AND r.status = 'approved'
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_reviewer_names(uuid[]) TO anon, authenticated;

-- Restrict storage bucket listing while keeping individual file reads working via direct URL
DROP POLICY IF EXISTS "Hospital images are publicly readable" ON storage.objects;

CREATE POLICY "Hospital images readable by authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'hospital-images');
