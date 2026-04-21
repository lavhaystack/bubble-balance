const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PH_PHONE_PATTERN = /^(?:\+639\d{9}|09\d{9})$/;

function normalizeValue(value: string) {
  return value.trim();
}

export function normalizePhilippinePhone(value: string) {
  return normalizeValue(value).replace(/[\s()-]/g, "");
}

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(normalizeValue(value));
}

export function isValidPhilippinePhone(value: string) {
  return PH_PHONE_PATTERN.test(normalizePhilippinePhone(value));
}

export function getEmailValidationError(value: string) {
  if (!normalizeValue(value)) {
    return "Email is required";
  }

  if (!isValidEmail(value)) {
    return "Enter a valid email address (example: name@email.com)";
  }

  return null;
}

export function getPhilippinePhoneValidationError(value: string) {
  if (!normalizeValue(value)) {
    return "Phone number is required";
  }

  if (!isValidPhilippinePhone(value)) {
    return "Use +639XXXXXXXXX or 09XXXXXXXXX format";
  }

  return null;
}
