// Field checks shared by the forms. Each returns an error message in Spanish,
// or "" when the value is fine.

export const NAME_MAX_LENGTH = 60;
export const PAIN_NAME_MAX_LENGTH = 40;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^[0-9+\-()\s]+$/;
const BIRTH_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const isValidEmail = (value) => EMAIL_PATTERN.test(String(value || "").trim());

export const validateName = (value, { label = "El nombre", max = NAME_MAX_LENGTH } = {}) => {
  const text = String(value || "").trim();
  if (!text) return `${label} es obligatorio.`;
  if (text.length > max) return `${label} no puede pasar de ${max} caracteres.`;
  return "";
};

// Optional field: empty is fine.
export const validatePhone = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  const digits = text.replace(/\D/g, "");
  if (!PHONE_CHARS.test(text) || digits.length < 7 || digits.length > 15) {
    return "Escribe un teléfono válido (entre 7 y 15 dígitos).";
  }
  return "";
};

// Optional field in YYYY-MM-DD, a real calendar date, not in the future.
export const validateBirthDate = (value, now = new Date()) => {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = BIRTH_DATE_PATTERN.exec(text);
  if (!match) return "Usa el formato AAAA-MM-DD, por ejemplo 1990-04-23.";
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  if (!isRealDate || year < 1900) return "Esa fecha no existe.";
  if (date > now) return "La fecha de nacimiento no puede ser futura.";
  return "";
};

export const validateProfile = ({ name, phone, birthDate }, now = new Date()) => {
  const errors = {
    name: validateName(name),
    phone: validatePhone(phone),
    birthDate: validateBirthDate(birthDate, now),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
};

// The API stores birth_date as a date but serialises it as an ISO timestamp
// ("1990-04-23T00:00:00.000Z"); the forms work with the AAAA-MM-DD part.
export const toDateInput = (value) => {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value || ""));
  return match ? match[1] : "";
};
