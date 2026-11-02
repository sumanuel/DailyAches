import { avatarIllustrations } from "../../constants/illustrations";
import {
  ONBOARDING_LAST_STEP,
  ONBOARDING_STEPS,
  clampStep,
  isLastStep,
  nextStep,
  previousStep,
  stepFromOffset,
} from "../onboarding";

describe("ONBOARDING_STEPS", () => {
  it("has three steps with unique keys and complete copy", () => {
    expect(ONBOARDING_STEPS).toHaveLength(3);
    expect(new Set(ONBOARDING_STEPS.map((s) => s.key)).size).toBe(3);
    for (const step of ONBOARDING_STEPS) {
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    }
  });

  it("only uses illustrations that exist", () => {
    for (const step of ONBOARDING_STEPS) {
      expect(avatarIllustrations[step.illustration]).toBeDefined();
    }
  });
});

describe("step navigation", () => {
  it("clamps to the guide and tolerates bad input", () => {
    expect(clampStep(-3)).toBe(0);
    expect(clampStep(99)).toBe(ONBOARDING_LAST_STEP);
    expect(clampStep(1.9)).toBe(1);
    expect(clampStep(NaN)).toBe(0);
    expect(clampStep(undefined)).toBe(0);
  });

  it("moves forward and back without leaving the range", () => {
    expect(nextStep(0)).toBe(1);
    expect(nextStep(ONBOARDING_LAST_STEP)).toBe(ONBOARDING_LAST_STEP);
    expect(previousStep(1)).toBe(0);
    expect(previousStep(0)).toBe(0);
  });

  it("knows the last step", () => {
    expect(isLastStep(0)).toBe(false);
    expect(isLastStep(ONBOARDING_LAST_STEP)).toBe(true);
  });

  it("maps a swipe offset to a step", () => {
    expect(stepFromOffset(0, 400)).toBe(0);
    expect(stepFromOffset(390, 400)).toBe(1);
    expect(stepFromOffset(800, 400)).toBe(2);
    expect(stepFromOffset(5000, 400)).toBe(ONBOARDING_LAST_STEP);
    expect(stepFromOffset(100, 0)).toBe(0);
  });
});
