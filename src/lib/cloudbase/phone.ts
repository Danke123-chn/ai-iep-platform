/** Normalize mainland China mobile to E.164 (+861xxxxxxxxxx). */
export function normalizeChinaPhone(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+86${digits}`;
  }

  if (trimmed.startsWith("+86") && digits.length === 13) {
    return `+86${digits.slice(-11)}`;
  }

  return null;
}

export function isValidChinaPhoneInput(input: string): boolean {
  return normalizeChinaPhone(input) !== null;
}
