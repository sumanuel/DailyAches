const AVATAR_FALLBACK_KEY = "Mujer feliz.png";
const PAIN_FALLBACK_KEY = "Mujer feliz.png";

export const avatarIllustrations = {
  "DolorDeCabeza.png": {
    glyph: "🤕",
    spark: "⚡",
    tone: "accentSky",
    halo: "primaryContainer",
  },
  "DolorDeEspalda.png": {
    glyph: "🫠",
    spark: "🩹",
    tone: "accentSun",
    halo: "secondaryContainer",
  },
  "DolorDePiernas.png": {
    glyph: "🦵",
    spark: "✨",
    tone: "accentMint",
    halo: "tertiaryContainer",
  },
  "Mujer feliz.png": {
    glyph: "🙂",
    spark: "♥",
    tone: "accentBerry",
    halo: "primaryContainer",
  },
  "Saltando.png": {
    glyph: "🤸",
    spark: "✦",
    tone: "accentMint",
    halo: "accentSky",
  },
  "Alegre.png": {
    glyph: "😄",
    spark: "✦",
    tone: "accentSun",
    halo: "accentBerry",
  },
  "Mareo.png": {
    glyph: "😵",
    spark: "~",
    tone: "accentSky",
    halo: "accentBerry",
  },
  "Trasnocho.png": {
    glyph: "😴",
    spark: "☾",
    tone: "heroBackdrop",
    halo: "accentBerry",
  },
};

export const painIllustrations = {
  "Alegre.png": {
    glyph: "😄",
    spark: "✦",
    tone: "accentMint",
    halo: "accentSun",
  },
  "Cabeza.png": {
    glyph: "🤕",
    spark: "⚡",
    tone: "accentSky",
    halo: "primaryContainer",
  },
  "Cervical.png": {
    glyph: "😣",
    spark: "~",
    tone: "accentBerry",
    halo: "secondaryContainer",
  },
  "Diarrea.png": {
    glyph: "🤢",
    spark: "!",
    tone: "accentMint",
    halo: "heroBackdrop",
  },
  "DolorDeCabeza.png": {
    glyph: "🤕",
    spark: "⚡",
    tone: "accentSky",
    halo: "primaryContainer",
  },
  "DolorDeEspalda.png": {
    glyph: "🩹",
    spark: "~",
    tone: "accentSun",
    halo: "secondaryContainer",
  },
  "DolorDePiernas.png": {
    glyph: "🦵",
    spark: "✦",
    tone: "accentMint",
    halo: "tertiaryContainer",
  },
  "Espalda.png": {
    glyph: "🩹",
    spark: "~",
    tone: "accentSun",
    halo: "secondaryContainer",
  },
  "Fiebre.png": {
    glyph: "🤒",
    spark: "🌡",
    tone: "heroBackdrop",
    halo: "accentSun",
  },
  "Gripe.png": {
    glyph: "🤧",
    spark: "❄",
    tone: "accentSky",
    halo: "heroBackdrop",
  },
  "Mamitis.png": {
    glyph: "🥺",
    spark: "♥",
    tone: "accentBerry",
    halo: "primaryContainer",
  },
  "Manos.png": {
    glyph: "✋",
    spark: "✦",
    tone: "accentMint",
    halo: "accentSky",
  },
  "Mareo.png": {
    glyph: "😵",
    spark: "~",
    tone: "accentSky",
    halo: "accentBerry",
  },
  "Muela.png": {
    glyph: "🦷",
    spark: "⚡",
    tone: "accentBerry",
    halo: "heroBackdrop",
  },
  "Mujer feliz.png": {
    glyph: "🙂",
    spark: "✦",
    tone: "accentMint",
    halo: "accentSun",
  },
  "Papitis.png": {
    glyph: "🙄",
    spark: "!",
    tone: "accentSun",
    halo: "heroBackdrop",
  },
  "Piernas.png": {
    glyph: "🦵",
    spark: "✦",
    tone: "accentMint",
    halo: "tertiaryContainer",
  },
  "Resaca.png": {
    glyph: "🥴",
    spark: "☕",
    tone: "heroBackdrop",
    halo: "accentSky",
  },
  "Saltando.png": {
    glyph: "🤸",
    spark: "✦",
    tone: "accentMint",
    halo: "accentSky",
  },
  "Senos.png": {
    glyph: "🫶",
    spark: "♥",
    tone: "accentBerry",
    halo: "primaryContainer",
  },
  "Trasnocho.png": {
    glyph: "😴",
    spark: "☾",
    tone: "heroBackdrop",
    halo: "accentBerry",
  },
  "Vientre.png": {
    glyph: "🤢",
    spark: "~",
    tone: "accentSun",
    halo: "heroBackdrop",
  },
  "Vomito.png": {
    glyph: "🤮",
    spark: "!",
    tone: "accentMint",
    halo: "heroBackdrop",
  },
};

const painNameMappings = {
  "Dolor de cabeza": "DolorDeCabeza.png",
  "Dolor de espalda": "DolorDeEspalda.png",
  "Dolor menstrual": "DolorDePiernas.png",
  "Dolor de estómago": "Vientre.png",
  "Dolor de estomago": "Vientre.png",
  "Dolor de garganta": "Gripe.png",
  "Dolor de dientes": "Muela.png",
  Otro: PAIN_FALLBACK_KEY,
};

export const avatarIllustrationKeys = Object.keys(avatarIllustrations);
export const painIllustrationKeys = Object.keys(painIllustrations);

export const getAvatarIllustration = (imageKey) =>
  avatarIllustrations[imageKey] || avatarIllustrations[AVATAR_FALLBACK_KEY];

export const getPainIllustration = (imageKey) =>
  painIllustrations[imageKey] || painIllustrations[PAIN_FALLBACK_KEY];

export const resolveAvatarIllustrationKey = (imageKey) =>
  avatarIllustrations[imageKey] ? imageKey : AVATAR_FALLBACK_KEY;

export const resolvePainIllustrationKey = (painType) => {
  if (typeof painType === "string") {
    return painIllustrations[painType] ? painType : PAIN_FALLBACK_KEY;
  }

  if (
    painType?.image &&
    typeof painType.image === "string" &&
    painIllustrations[painType.image]
  ) {
    return painType.image;
  }

  const mappedKey = painNameMappings[painType?.name];
  return mappedKey || PAIN_FALLBACK_KEY;
};
