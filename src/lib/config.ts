export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.snowflow.de";

export function alternateLanguages(path: string) {
  return {
    de: `${SITE_URL}/de${path}`,
    en: `${SITE_URL}/en${path}`,
  };
}
