const GHANA_PHONE_REGEX = /^\+233[2-5]\d{8}$/;

export function normalizeGhanaPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '+233' + cleaned.slice(1);
  } else if (cleaned.startsWith('233')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+233' + cleaned;
  }

  return cleaned;
}

export function isValidGhanaPhone(phone: string): boolean {
  return GHANA_PHONE_REGEX.test(normalizeGhanaPhone(phone));
}
