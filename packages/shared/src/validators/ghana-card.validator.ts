const GHANA_CARD_REGEX = /^GHA-\d{9}-\d$/;

export function isValidGhanaCard(number: string): boolean {
  return GHANA_CARD_REGEX.test(number.toUpperCase());
}

export function formatGhanaCard(number: string): string {
  return number.toUpperCase().replace(/\s/g, '');
}
