
-- Pathology labs directory
CREATE TABLE public.pathology_labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_hi TEXT,
  city TEXT NOT NULL,
  city_hi TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  tests TEXT[] NOT NULL DEFAULT '{}',
  open_24_7 BOOLEAN NOT NULL DEFAULT false,
  home_collection BOOLEAN NOT NULL DEFAULT false,
  accreditation TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  rating NUMERIC NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pathology_labs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Labs viewable by everyone" ON public.pathology_labs FOR SELECT USING (true);
CREATE POLICY "Editors can insert labs" ON public.pathology_labs FOR INSERT WITH CHECK (public.can_edit_hospital(auth.uid()));
CREATE POLICY "Editors can update labs" ON public.pathology_labs FOR UPDATE USING (public.can_edit_hospital(auth.uid()));
CREATE POLICY "Editors can delete labs" ON public.pathology_labs FOR DELETE USING (public.can_edit_hospital(auth.uid()));

CREATE TRIGGER update_pathology_labs_updated_at
BEFORE UPDATE ON public.pathology_labs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trusted external links surfaced in symptom search
CREATE TABLE public.trusted_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_hi TEXT,
  url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  description_hi TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trusted_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trusted links viewable by everyone" ON public.trusted_links FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert trusted links" ON public.trusted_links FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update trusted links" ON public.trusted_links FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete trusted links" ON public.trusted_links FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_trusted_links_updated_at
BEFORE UPDATE ON public.trusted_links
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a few trusted sources
INSERT INTO public.trusted_links (title, title_hi, url, description, description_hi, category, display_order) VALUES
('Ministry of Health & Family Welfare', 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय', 'https://www.mohfw.gov.in/', 'Official health information from the Government of India.', 'भारत सरकार की आधिकारिक स्वास्थ्य जानकारी।', 'gov', 1),
('National Health Portal (India)', 'राष्ट्रीय स्वास्थ्य पोर्टल', 'https://www.nhp.gov.in/', 'Curated, citizen-focused health information.', 'नागरिकों के लिए स्वास्थ्य जानकारी।', 'gov', 2),
('WHO – Health Topics', 'विश्व स्वास्थ्य संगठन', 'https://www.who.int/health-topics', 'World Health Organization disease and condition library.', 'विश्व स्वास्थ्य संगठन रोग जानकारी।', 'global', 3),
('MedlinePlus (NIH)', 'मेडलाइनप्लस', 'https://medlineplus.gov/', 'US National Library of Medicine consumer health information.', 'अमेरिकी राष्ट्रीय चिकित्सा पुस्तकालय।', 'reference', 4);
