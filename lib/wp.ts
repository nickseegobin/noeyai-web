const WP_API = process.env.NEXT_PUBLIC_WP_API;

export interface SliderMessage {
  header: string;
  copy:   string;
  image:  string;
}

export interface SiteSettings {
  logo_id:      number | null;
  logo_url:     string | null;
  efoundry_url: string | null;
  tagline:      string | null;
}

/* export async function getSliderMessages(): Promise<SliderMessage[]> {
  try {
    const res = await fetch(`${WP_API}/noeyai/v1/messages`, {
      cache: 'no-store', // disable cache during development
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
 */
/* export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${WP_API}/noeyai/v1/site`, {
      cache: 'no-store', // disable cache during development
    });
    if (!res.ok) return { logo_id: null, logo_url: null, efoundry_url: null, tagline: null };
    return res.json();
  } catch {
    return { logo_id: null, logo_url: null, efoundry_url: null, tagline: null };
  }
} */

  export async function getSliderMessages(): Promise<SliderMessage[]> {
  try {
    const res = await fetch(`${WP_API}/noeyai/v1/messages`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

  export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${WP_API}/noeyai/v1/site`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { logo_id: null, logo_url: null, efoundry_url: null, tagline: null };
    return res.json();
  } catch {
    return { logo_id: null, logo_url: null, efoundry_url: null, tagline: null };
  }
}