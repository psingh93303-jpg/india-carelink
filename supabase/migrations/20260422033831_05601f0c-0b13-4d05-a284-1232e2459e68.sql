-- Helper functions for role checks
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin','manager','hospital_manager','financial_manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_hospital(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin','manager','hospital_manager')
  );
$$;

-- DEPARTMENTS
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_hi text,
  description text NOT NULL DEFAULT '',
  head_doctor text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_departments_hospital ON public.departments(hospital_id);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments viewable by everyone" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Editors can insert departments" ON public.departments FOR INSERT WITH CHECK (public.can_edit_hospital(auth.uid()));
CREATE POLICY "Editors can update departments" ON public.departments FOR UPDATE USING (public.can_edit_hospital(auth.uid()));
CREATE POLICY "Editors can delete departments" ON public.departments FOR DELETE USING (public.can_edit_hospital(auth.uid()));
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DOCTORS
CREATE TABLE public.doctors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  name text NOT NULL,
  name_hi text,
  specialty text NOT NULL DEFAULT '',
  qualification text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  consultation_hours text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_doctors_hospital ON public.doctors(hospital_id);
CREATE INDEX idx_doctors_department ON public.doctors(department_id);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors viewable by everyone" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Editors can insert doctors" ON public.doctors FOR INSERT WITH CHECK (public.can_edit_hospital(auth.uid()));
CREATE POLICY "Editors can update doctors" ON public.doctors FOR UPDATE USING (public.can_edit_hospital(auth.uid()));
CREATE POLICY "Editors can delete doctors" ON public.doctors FOR DELETE USING (public.can_edit_hospital(auth.uid()));
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HOSPITAL STAFF
CREATE TABLE public.hospital_staff (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name text NOT NULL,
  role_title text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_hospital_staff_hospital ON public.hospital_staff(hospital_id);
ALTER TABLE public.hospital_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff viewable by everyone" ON public.hospital_staff FOR SELECT USING (true);
CREATE POLICY "Editors can insert staff" ON public.hospital_staff FOR INSERT WITH CHECK (public.can_edit_hospital(auth.uid()));
CREATE POLICY "Editors can update staff" ON public.hospital_staff FOR UPDATE USING (public.can_edit_hospital(auth.uid()));
CREATE POLICY "Editors can delete staff" ON public.hospital_staff FOR DELETE USING (public.can_edit_hospital(auth.uid()));
CREATE TRIGGER update_hospital_staff_updated_at BEFORE UPDATE ON public.hospital_staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();