import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { Text, useTheme as usePaperTheme } from "react-native-paper";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";
import { celebrationMessage } from "../utils/progressEvents";
import { useBurst } from "./BurstProvider";

const SHOW_MS = 3200;
const SHOW_BIG_MS = 5000; // achievements and level-ups deserve a longer look

// Colors come from the theme pairs that the palette test keeps at AA contrast.
const TONES = {
  points: ["primaryContainer", "onPrimaryContainer"],
  achievement: ["tertiaryContainer", "onTertiaryContainer"],
  level: ["secondaryContainer", "onSecondaryContainer"],
};

// A banner that drops in from the top when a record is saved, an achievement
// unlocks or the level goes up. It never takes touches. Reanimated skips the
// motion when the system asks to reduce it.
const ProgressCelebration = () => {
  const { user } = useUser();
  const paperTheme = usePaperTheme();
  // The context (not the hook) is read so a missing provider just means no inset.
  const insets = useContext(SafeAreaInsetsContext);
  const event = user.progressEvent;
  const [hiddenId, setHiddenId] = useState(null);

  const eventId = event?.id;
  const message = event ? celebrationMessage(event) : null;
  const duration = message?.kind === "points" ? SHOW_MS : SHOW_BIG_MS;
  const fire = useBurst();
  const { width } = useWindowDimensions();
  const kind = message?.kind;
  const top = (insets?.top ?? 0) + 44;

  // A level-up rains confetti and an achievement throws it. A plain record has
  // no confetti here: the screen that saved it reacts to its intensity. Each
  // event is celebrated once.
  useEffect(() => {
    if (!eventId) return;
    const where = { x: width / 2, y: top };
    if (kind === "level") {
      fire("rain");
      fire("confetti", where);
    } else if (kind === "achievement") {
      fire("confetti", where);
    }
    // Only a new event should fire; the rest is read as it is at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return undefined;
    const timer = setTimeout(() => setHiddenId(eventId), duration);
    return () => clearTimeout(timer);
  }, [eventId, duration]);

  const visible = Boolean(event) && event.id !== hiddenId;
  const [background, foreground] = visible ? TONES[message.kind] : [];

  // The wrapper stays mounted: unmounting it would cut the exit animation of
  // the banner short (and, on web, remove a node that is already gone).
  return (
    <View
      pointerEvents="none"
      style={[styles.wrapper, { top: (insets?.top ?? 0) + 8 }]}
    >
      {visible ? (
      <Animated.View
        entering={FadeInUp.springify().damping(16)}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[
          styles.banner,
          { backgroundColor: paperTheme.colors[background] },
        ]}
      >
        <Animated.Text
          entering={ZoomIn.springify().damping(8).delay(120)}
          allowFontScaling={false}
          style={styles.icon}
        >
          {message.icon}
        </Animated.Text>
        <View style={styles.texts}>
          <Text
            variant="titleSmall"
            style={[styles.title, { color: paperTheme.colors[foreground] }]}
          >
            {message.title}
          </Text>
          {message.detail ? (
            <Text style={{ color: paperTheme.colors[foreground] }}>
              {message.detail}
            </Text>
          ) : null}
        </View>
      </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 10,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    maxWidth: 480,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: { fontSize: 28 },
  texts: { flexShrink: 1 },
  title: { fontWeight: "800" },
});

export default ProgressCelebration;
