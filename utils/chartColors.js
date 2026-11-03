// Which color a chart bar gets. Colors come from the theme (palettes.js), so
// they follow light and dark mode and keep their contrast.

// Rankings (pain types, people): one color per bar, in this order.
export const CATEGORY_COLOR_KEYS = [
  "chartCoral",
  "chartBlue",
  "chartTeal",
  "chartAmber",
  "chartPurple",
  "chartPink",
  "chartGreen",
  "chartCyan",
];

export const categoryColor = (colors, index) =>
  colors[CATEGORY_COLOR_KEYS[index % CATEGORY_COLOR_KEYS.length]];

// Bars over time: calm teal for a light period, amber in the middle, coral for
// the heaviest. Height already says how much; the color only adds a hint.
export const intensityColor = (colors, ratio) => {
  if (ratio <= 1 / 3) return colors.chartTeal;
  if (ratio <= 2 / 3) return colors.chartAmber;
  return colors.chartCoral;
};
