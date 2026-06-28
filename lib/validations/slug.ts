export const RESERVED_COMPANY_SLUGS = new Set([
  "platform",
  "default",
  "admin",
  "api",
  "login",
  "register",
  "c",
  "platform",
  "dashboard",
  "driver",
  "customer",
  "orders",
  "settings",
  "serwist",
]);

export function slugifyCompanyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function isReservedCompanySlug(slug: string): boolean {
  return RESERVED_COMPANY_SLUGS.has(slug);
}
