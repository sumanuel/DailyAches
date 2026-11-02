import { darkColors, lightColors } from "../../constants/palettes";
import { AA_TEXT, contrastRatio, meetsAA, relativeLuminance } from "../contrast";

describe("contrastRatio", () => {
  it("gives the WCAG extremes and is symmetric", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
  });

  it("matches a known reference value", () => {
    // #767676 on white is the classic "just passes AA" gray
    expect(contrastRatio("#767676", "#FFFFFF")).toBeGreaterThan(4.5);
    expect(contrastRatio("#777777", "#FFFFFF")).toBeLessThan(4.5);
  });

  it("rejects anything that is not #RRGGBB", () => {
    expect(() => relativeLuminance("red")).toThrow();
    expect(meetsAA("#000000", "#FFFFFF")).toBe(true);
  });
});

// Every foreground/background pair the screens actually put together.
const TEXT_PAIRS = [
  ["onPrimary", "primary"], // contained buttons, header bar
  ["onPrimaryContainer", "primaryContainer"],
  ["onSecondary", "secondary"],
  ["onSecondaryContainer", "secondaryContainer"],
  ["onTertiary", "tertiary"],
  ["onTertiaryContainer", "tertiaryContainer"],
  ["onBackground", "background"],
  ["onSurface", "surface"],
  ["onSurfaceVariant", "surface"],
  ["onSurfaceVariant", "background"],
  ["onSurfaceVariant", "surfaceVariant"],
  ["onSurface", "surfaceVariant"],
  ["primary", "surface"], // eyebrows, text buttons, links
  ["primary", "background"],
  ["primary", "surfaceVariant"],
  ["error", "surface"],
  ["error", "background"],
  ["onSurface", "heroBackdrop"],
  ["onSurface", "accentMint"],
  ["onSurface", "accentSun"],
  ["onSurface", "accentBerry"],
  ["onSurface", "accentSky"],
  ["onSurfaceVariant", "accentSky"],
];

describe.each([
  ["light", lightColors],
  ["dark", darkColors],
])("%s palette", (name, colors) => {
  it.each(TEXT_PAIRS)("%s on %s reaches AA (4.5:1)", (foreground, background) => {
    expect(colors[foreground]).toBeDefined();
    expect(colors[background]).toBeDefined();
    const ratio = contrastRatio(colors[foreground], colors[background]);
    expect(`${foreground} on ${background}: ${ratio.toFixed(2)}`).toMatch(/.*/);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("uses only #RRGGBB colors, so the check covers every one", () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
