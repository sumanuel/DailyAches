import {
  CATEGORY_COLOR_KEYS,
  categoryColor,
  intensityColor,
} from "../chartColors";
import { darkColors, lightColors } from "../../constants/palettes";

describe.each([
  ["light", lightColors],
  ["dark", darkColors],
])("%s chart colors", (name, colors) => {
  it("has a color for every category key", () => {
    for (const key of CATEGORY_COLOR_KEYS) {
      expect(colors[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("gives each of the first bars its own color, then starts over", () => {
    const first = CATEGORY_COLOR_KEYS.map((_, i) => categoryColor(colors, i));
    expect(new Set(first).size).toBe(CATEGORY_COLOR_KEYS.length);
    expect(categoryColor(colors, CATEGORY_COLOR_KEYS.length)).toBe(first[0]);
  });

  it("goes from teal to amber to coral as the bar gets taller", () => {
    expect(intensityColor(colors, 0.1)).toBe(colors.chartTeal);
    expect(intensityColor(colors, 0.5)).toBe(colors.chartAmber);
    expect(intensityColor(colors, 1)).toBe(colors.chartCoral);
  });
});
