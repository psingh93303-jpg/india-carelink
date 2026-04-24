CREATE TABLE IF NOT EXISTS public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  role_access public.app_role[] NOT NULL DEFAULT ARRAY[]::public.app_role[],
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  updated_by uuid,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cms_pages_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT cms_pages_status_check CHECK (status IN ('draft','published'))
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON public.cms_pages (slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON public.cms_pages (status);

CREATE OR REPLACE FUNCTION public.can_view_cms_page(_roles public.app_role[], _status text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT _status = 'published'
    AND (
      COALESCE(array_length(_roles, 1), 0) = 0
      OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role = ANY(_roles)
      )
    )
$$;

DROP POLICY IF EXISTS "CMS pages are visible by access" ON public.cms_pages;
CREATE POLICY "CMS pages are visible by access"
ON public.cms_pages
FOR SELECT
USING (
  public.can_view_cms_page(role_access, status)
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

DROP POLICY IF EXISTS "Admins and managers can create CMS pages" ON public.cms_pages;
CREATE POLICY "Admins and managers can create CMS pages"
ON public.cms_pages
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Admins and managers can update CMS pages" ON public.cms_pages;
CREATE POLICY "Admins and managers can update CMS pages"
ON public.cms_pages
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Admins and managers can delete CMS pages" ON public.cms_pages;
CREATE POLICY "Admins and managers can delete CMS pages"
ON public.cms_pages
FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

DROP TRIGGER IF EXISTS update_cms_pages_updated_at ON public.cms_pages;
CREATE TRIGGER update_cms_pages_updated_at
BEFORE UPDATE ON public.cms_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_name text NOT NULL,
  basic_info text NOT NULL DEFAULT '',
  document_paths text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'pending',
  reviewer_id uuid,
  reviewer_notes text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_requests_entity_type_check CHECK (entity_type IN ('hospital','lab')),
  CONSTRAINT verification_requests_status_check CHECK (status IN ('pending','approved','rejected'))
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests (status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_entity ON public.verification_requests (entity_type, entity_id);

DROP POLICY IF EXISTS "Users can view their verification requests" ON public.verification_requests;
CREATE POLICY "Users can view their verification requests"
ON public.verification_requests
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

DROP POLICY IF EXISTS "Users can create verification requests" ON public.verification_requests;
CREATE POLICY "Users can create verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and managers can update verification requests" ON public.verification_requests;
CREATE POLICY "Admins and managers can update verification requests"
ON public.verification_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Admins and managers can delete verification requests" ON public.verification_requests;
CREATE POLICY "Admins and managers can delete verification requests"
ON public.verification_requests
FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

DROP TRIGGER IF EXISTS update_verification_requests_updated_at ON public.verification_requests;
CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload verification documents" ON storage.objects;
CREATE POLICY "Users can upload verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users and reviewers can view verification documents" ON storage.objects;
CREATE POLICY "Users and reviewers can view verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);

DROP POLICY IF EXISTS "Users can update verification documents" ON storage.objects;
CREATE POLICY "Users can update verification documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'verification-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users and reviewers can delete verification documents" ON storage.objects;
CREATE POLICY "Users and reviewers can delete verification documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'verification-documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);