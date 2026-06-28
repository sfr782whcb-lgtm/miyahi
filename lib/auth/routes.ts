import type { UserRole } from "@prisma/client";

export const PUBLIC_PATHS = ["/", "/login", "/register", "/~offline"] as const;

export const AUTH_PAGES = ["/", "/login", "/register"] as const;

export const PLATFORM_PREFIXES = ["/platform"] as const;

export const ADMIN_PREFIXES = [
  "/dashboard",
  "/orders",
  "/drivers",
  "/reports",
  "/customers",
  "/products",
  "/settings",
] as const;

export const DRIVER_PREFIXES = ["/driver"] as const;
export const CUSTOMER_PREFIXES = ["/customer"] as const;

export function getHomeForRole(role: UserRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return "/platform";
    case "ADMIN":
      return "/dashboard";
    case "DRIVER":
      return "/driver";
    case "CUSTOMER":
      return "/customer";
    default:
      return "/login";
  }
}

export function isAuthPage(pathname: string) {
  return AUTH_PAGES.includes(pathname as (typeof AUTH_PAGES)[number]);
}

export function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number]) ||
    pathname.startsWith("/serwist") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/manifest.json" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  );
}

export function isPlatformPath(pathname: string) {
  return PLATFORM_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAdminPath(pathname: string) {
  return ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isDriverPath(pathname: string) {
  return DRIVER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isCustomerPath(pathname: string) {
  return CUSTOMER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function canAccessPath(role: UserRole, pathname: string) {
  if (isPlatformPath(pathname)) return role === "SUPER_ADMIN";
  if (isAdminPath(pathname)) return role === "ADMIN";
  if (isDriverPath(pathname)) return role === "DRIVER";
  if (isCustomerPath(pathname)) return role === "CUSTOMER";
  return true;
}
