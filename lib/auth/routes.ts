import type { UserRole } from "@prisma/client";

export const PUBLIC_PATHS = ["/", "/~offline"] as const;

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
    case "ADMIN":
      return "/dashboard";
    case "DRIVER":
      return "/driver";
    case "CUSTOMER":
      return "/customer";
    default:
      return "/";
  }
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
  if (isAdminPath(pathname)) return role === "ADMIN";
  if (isDriverPath(pathname)) return role === "DRIVER";
  if (isCustomerPath(pathname)) return role === "CUSTOMER";
  return true;
}
