---
description: "Use when designing or editing DailyAches mobile UI in screens, navigation, theme, or reusable components. Covers the visual direction, spacing rhythm, card hierarchy, empty states, and humane health-app tone for this Expo React Native project."
name: "DailyAches UI"
applyTo: "screens/**/*.js,components/**/*.js,context/ThemeContext.js,navigation/**/*.js"
---

# DailyAches UI Guidelines

- Design for a calm, humane health-tracking experience. The app should feel supportive and clear, not overly clinical or gamified.
- Keep visual hierarchy obvious: one primary action per screen, then supporting stats, then detailed records.
- Prefer soft surfaces over hard separators. Use rounded cards, muted backgrounds, and restrained accents from the theme.
- Use the existing theme tokens instead of hard-coded colors whenever practical. Reserve direct colors for rare decorative neutrals.
- Respect mobile touch ergonomics: generous spacing, comfortable tap targets, and safe breathing room around destructive actions.
- Empty states must feel intentional. Pair one illustration with a short supportive message and a direct CTA.
- Record history should scan quickly. Lead with the person, then pain type, then time, then notes.
- Keep copy short and friendly in Spanish. Avoid technical or alarmist wording.
- Favor consistency over novelty: similar card types should share padding, radius, and content rhythm.
- When a screen contains health data, use decorative elements sparingly and keep readability ahead of ornament.
