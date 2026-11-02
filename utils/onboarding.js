// Steps of the first-run guide. Pure data and helpers, no React.

export const ONBOARDING_STEPS = [
  {
    key: "welcome",
    eyebrow: "BIENVENIDA",
    title: "Tus achaques, bien anotados",
    description:
      "DailyAches guarda cada dolor para que no dependas de la memoria. Eso sí: de los dolores, ni una queja de más.",
    illustration: "Mujer feliz.png",
  },
  {
    key: "record",
    eyebrow: "REGISTRAR",
    title: "Anotar es cuestión de segundos",
    description:
      "Elige a la persona, el tipo de dolor y qué tan fuerte fue. Si hay algo que contar, déjalo en una nota.",
    illustration: "DolorDeCabeza.png",
  },
  {
    key: "patterns",
    eyebrow: "DESCUBRIR",
    title: "Patrones, logros y un informe para el médico",
    description:
      "Mira cuándo y cuánto duele, gana logros por constancia y exporta el historial cuando llegue la consulta.",
    illustration: "Saltando.png",
  },
];

export const ONBOARDING_LAST_STEP = ONBOARDING_STEPS.length - 1;

// Keeps the step inside the guide, whatever number comes in.
export const clampStep = (step) => {
  const value = Number.isFinite(step) ? Math.trunc(step) : 0;
  return Math.min(Math.max(value, 0), ONBOARDING_LAST_STEP);
};

export const isLastStep = (step) => clampStep(step) === ONBOARDING_LAST_STEP;

export const nextStep = (step) => clampStep(clampStep(step) + 1);
export const previousStep = (step) => clampStep(clampStep(step) - 1);

// Step shown after a horizontal swipe ended at `offsetX` in a page of `width`.
export const stepFromOffset = (offsetX, width) =>
  width > 0 ? clampStep(Math.round(offsetX / width)) : 0;
