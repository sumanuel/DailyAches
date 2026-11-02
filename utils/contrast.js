// WCAG 2 contrast between two sRGB hex colors.

const channel = (value) => {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (hex) => {
  const clean = String(hex).replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`Expected a #RRGGBB color, got "${hex}"`);
  }
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(clean.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// 1 (identical) to 21 (black on white).
export const contrastRatio = (foreground, background) => {
  const [lighter, darker] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

export const AA_TEXT = 4.5; // normal text
export const AA_LARGE_OR_UI = 3; // large text and interface components

export const meetsAA = (foreground, background, minimum = AA_TEXT) =>
  contrastRatio(foreground, background) >= minimum;
