// Dailyaches-api answers in English. These messages are what the user sees.

const BY_MESSAGE = [
  // pain types and records that block each other
  ["being used in existing records", "No se puede eliminar: ese tipo de dolor ya tiene registros."],
  ["pain type with this name already exists", "Ya existe un tipo de dolor con ese nombre."],
  ["another pain type with this name already exists", "Ya existe otro tipo de dolor con ese nombre."],
  ["pain type not found", "No encontramos ese tipo de dolor."],
  ["person not found", "No encontramos a esa persona."],
  ["record not found", "No encontramos ese registro."],
  ["pain_level must be between 1 and 10", "La intensidad debe estar entre 1 y 10."],
  // account and session
  ["invalid credentials", "El correo o la contraseña no son correctos."],
  ["email already registered", "Ese correo ya tiene una cuenta."],
  ["email must be a valid email address", "Escribe un correo válido."],
  ["email and password are required", "Escribe tu correo y tu contraseña."],
  ["password must be at least 6 characters", "La contraseña debe tener al menos 6 caracteres."],
  ["failed to register user", "No se pudo crear la cuenta. Inténtalo de nuevo."],
  ["user is disabled", "Esta cuenta está desactivada."],
  ["invalid or expired token", "Tu sesión expiró. Inicia sesión de nuevo."],
  ["missing authorization header", "Tu sesión expiró. Inicia sesión de nuevo."],
  ["invalid authorization header", "Tu sesión expiró. Inicia sesión de nuevo."],
  // field validation
  ["birth date must be in yyyy-mm-dd format", "La fecha de nacimiento no es válida."],
  ["phone must be a string or null", "El teléfono no es válido."],
  ["name is required", "El nombre es obligatorio."],
  ["name must be a non-empty string", "El nombre no puede estar vacío."],
  ["no fields to update", "No hay cambios que guardar."],
  ["no valid fields to update", "No hay cambios que guardar."],
];

const BY_STATUS = {
  400: "Revisa los datos e inténtalo de nuevo.",
  401: "Tu sesión expiró. Inicia sesión de nuevo.",
  403: "No tienes permiso para hacer esto.",
  404: "No encontramos lo que buscabas.",
  409: "Eso entra en conflicto con datos que ya existen.",
};

export const SERVER_ERROR = "El servidor no respondió bien. Inténtalo de nuevo en un momento.";
export const UNKNOWN_ERROR = "Ocurrió un error inesperado. Inténtalo de nuevo.";

// Returns Spanish text for an API message. Unknown English messages fall back to
// a sentence for the HTTP status, never to the raw English.
export const translateApiError = (message, status) => {
  const text = String(message || "").toLowerCase();
  if (text) {
    const match = BY_MESSAGE.find(([needle]) => text.includes(needle));
    if (match) return match[1];
  }
  if (status >= 500) return SERVER_ERROR;
  if (BY_STATUS[status]) return BY_STATUS[status];
  return UNKNOWN_ERROR;
};
