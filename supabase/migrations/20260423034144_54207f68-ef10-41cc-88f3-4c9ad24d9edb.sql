-- Add human_resource_manager to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'human_resource_manager';

-- Add verification fields to hospitals
ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid;

-- Add verification fields to pathology_labs
ALTER TABLE public.pathology_labs
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid;

-- Indexes to speed up ranking queries
CREATE INDEX IF NOT EXISTS idx_hospitals_ranking ON public.hospitals (is_verified DESC, rating DESC, reviews_count DESC);
CREATE INDEX IF NOT EXISTS idx_labs_ranking ON public.pathology_labs (is_verified DESC, rating DESC);

-- Allow admins and managers to verify (update is_verified). Existing admin update policy already covers admin.
-- Add a manager update policy limited to verification fields is non-trivial in RLS; instead allow managers to update hospitals/labs broadly via can_edit_hospital — already in place for labs. For hospitals, add manager update policy.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hospitals' AND policyname='Editors can update hospitals'
  ) THEN
    CREATE POLICY "Editors can update hospitals" ON public.hospitals
      FOR UPDATE USING (public.can_edit_hospital(auth.uid()));
  END IF;
END$$;