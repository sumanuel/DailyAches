import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { Button, Text, useTheme as usePaperTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppScreen from "../components/AppScreen";
import IllustrationBadge from "../components/IllustrationBadge";
import { getAvatarIllustration } from "../constants/illustrations";
import {
  ONBOARDING_STEPS,
  isLastStep,
  stepFromOffset,
} from "../utils/onboarding";

const BADGE_SIZE = 132;

// First-run guide. `onDone` is given when it is the first time (the navigator
// then moves on to the app); when reopened from "Más" it just goes back.
const OnboardingScreen = ({ navigation, onDone }) => {
  const paperTheme = usePaperTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const [step, setStep] = useState(0);
  const last = isLastStep(step);

  const finish = () => {
    if (onDone) onDone();
    else navigation.goBack();
  };

  const goTo = (index) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setStep(index);
  };

  const handleNext = () => (last ? finish() : goTo(step + 1));

  const handleScrollEnd = (event) => {
    setStep(stepFromOffset(event.nativeEvent.contentOffset.x, width));
  };

  return (
    <AppScreen scroll={false} contentContainerStyle={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        {last ? null : (
          <Button onPress={finish} accessibilityLabel="Saltar la guía">
            Saltar
          </Button>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.pages}
      >
        {ONBOARDING_STEPS.map((item) => (
          <View key={item.key} style={[styles.page, { width }]}>
            <IllustrationBadge
              preset={getAvatarIllustration(item.illustration)}
              size={BADGE_SIZE}
            />
            <Text style={[styles.eyebrow, { color: paperTheme.colors.primary }]}>
              {item.eyebrow}
            </Text>
            <Text variant="headlineMedium" style={styles.title}>
              {item.title}
            </Text>
            <Text
              style={[
                styles.description,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {item.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View
          style={styles.dots}
          accessible
          accessibilityLabel={`Paso ${step + 1} de ${ONBOARDING_STEPS.length}`}
        >
          {ONBOARDING_STEPS.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === step
                      ? paperTheme.colors.primary
                      : paperTheme.colors.outlineVariant,
                },
                index === step && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.cta}
          contentStyle={styles.ctaContent}
        >
          {last ? "Empezar" : "Siguiente"}
        </Button>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 0,
    paddingBottom: 0,
  },
  topBar: {
    minHeight: 56,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  pages: {
    flex: 1,
  },
  page: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 14,
  },
  eyebrow: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 420,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 18,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  cta: {
    borderRadius: 24,
  },
  ctaContent: {
    height: 48,
  },
});

export default OnboardingScreen;
