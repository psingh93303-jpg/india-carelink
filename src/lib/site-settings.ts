import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FooterLink = { label_en: string; label_hi: string; href: string };
export type SocialLinks = {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
};

export type SiteSettings = {
  id: string;
  brand_name: string;
  brand_name_hi: string;
  tagline_en: string;
  tagline_hi: string;
  current_version: string;
  whats_new_en: string;
  whats_new_hi: string;
  disclaimer_en: string;
  disclaimer_hi: string;
  contact_intro_en: string;
  contact_intro_hi: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  social_links: SocialLinks;
  footer_links: FooterLink[];
};

let cache: SiteSettings | null = null;
const subscribers = new Set<(s: SiteSettings | null) => void>();

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("[site-settings] fetch failed", error.message);
    return null;
  }
  if (data) {
    cache = {
      ...(data as unknown as SiteSettings),
      social_links: (data.social_links ?? {}) as SocialLinks,
      footer_links: (data.footer_links ?? []) as FooterLink[],
    };
    subscribers.forEach((cb) => cb(cache));
  }
  return cache;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    const cb = (s: SiteSettings | null) => setSettings(s);
    subscribers.add(cb);
    if (!cache) {
      fetchSiteSettings().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  return { settings, loading, refresh: fetchSiteSettings };
}

export function invalidateSiteSettings() {
  cache = null;
  fetchSiteSettings();
}
