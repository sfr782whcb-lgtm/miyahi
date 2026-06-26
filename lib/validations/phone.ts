export const SAUDI_PHONE_REGEX = /^05\d{8}$/;

export const SAUDI_PHONE_MESSAGE =
  "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

export function isValidSaudiPhone(phone: string): boolean {
  return SAUDI_PHONE_REGEX.test(normalizePhone(phone));
}
