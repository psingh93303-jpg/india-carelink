-- Single-row config table
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL DEFAULT 'CareLink India',
  brand_name_hi text NOT NULL DEFAULT 'केयरलिंक इंडिया',
  tagline_en text NOT NULL DEFAULT 'Find Hospital & Emergency care across the India',
  tagline_hi text NOT NULL DEFAULT 'पूरे भारत में अस्पताल और आपातकालीन देखभाल खोजें',
  current_version text NOT NULL DEFAULT 'v1.1.0',
  whats_new_en text NOT NULL DEFAULT '',
  whats_new_hi text NOT NULL DEFAULT '',
  disclaimer_en text NOT NULL DEFAULT '',
  disclaimer_hi text NOT NULL DEFAULT '',
  contact_intro_en text NOT NULL DEFAULT '',
  contact_intro_hi text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_address text NOT NULL DEFAULT '',
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  footer_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings readable by everyone"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Version history for "What's New"
CREATE TABLE public.version_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  notes_en text NOT NULL DEFAULT '',
  notes_hi text NOT NULL DEFAULT '',
  released_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.version_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Version history readable by everyone"
  ON public.version_history FOR SELECT USING (true);

CREATE POLICY "Admins can insert version history"
  ON public.version_history FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update version history"
  ON public.version_history FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete version history"
  ON public.version_history FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed
INSERT INTO public.site_settings (
  brand_name, brand_name_hi, tagline_en, tagline_hi, current_version,
  whats_new_en, whats_new_hi,
  disclaimer_en, disclaimer_hi,
  contact_intro_en, contact_intro_hi,
  contact_phone, contact_email, contact_address,
  social_links, footer_links
) VALUES (
  'CareLink India', 'केयरलिंक इंडिया',
  'Find Hospital & Emergency care across the India',
  'पूरे भारत में अस्पताल और आपातकालीन देखभाल खोजें',
  'v1.1.0',
  '- Rebranded as CareLink India\n- New Disclaimer & Contact pages\n- Versioning + What''s New system\n- Testing-phase notice popup',
  '- केयरलिंक इंडिया के रूप में नया ब्रांड\n- नए डिस्क्लेमर और संपर्क पेज\n- संस्करण और नया क्या है सिस्टम',
  'CareLink India is an information directory only. We do not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns. Hospital details are gathered from public sources and may change without notice.',
  'केयरलिंक इंडिया केवल एक सूचना निर्देशिका है। हम चिकित्सा सलाह, निदान या उपचार प्रदान नहीं करते। चिकित्सा संबंधी चिंताओं के लिए हमेशा योग्य स्वास्थ्य पेशेवर से परामर्श करें।',
  'Have questions or feedback? We''d love to hear from you.',
  'कोई प्रश्न या सुझाव है? हमें आपसे सुनना अच्छा लगेगा।',
  '+91-00000-00000', 'support@carelinkindia.example', 'Lucknow, Uttar Pradesh, India',
  '{"twitter":"","facebook":"","instagram":"","linkedin":""}'::jsonb,
  '[{"label_en":"About","label_hi":"हमारे बारे में","href":"/about"},{"label_en":"Contact","label_hi":"संपर्क","href":"/contact"},{"label_en":"Disclaimer","label_hi":"अस्वीकरण","href":"/disclaimer"}]'::jsonb
);

INSERT INTO public.version_history (version, notes_en, notes_hi) VALUES
('v1.1.0',
 '- Rebranded as CareLink India\n- New Disclaimer & Contact pages\n- Versioning + What''s New popup\n- Testing-phase notice popup',
 '- केयरलिंक इंडिया के रूप में नया ब्रांड\n- नए डिस्क्लेमर और संपर्क पेज\n- संस्करण और नया क्या है पॉपअप');