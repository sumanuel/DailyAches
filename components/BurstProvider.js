import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useTheme as usePaperTheme } from "react-native-paper";
import { burstLength, makeParticles } from "../utils/particles";

// Confetti, hearts and emojis that burst out of a tap. They are drawn on one
// transparent layer over the whole app (so no card clips them and they never
// take a touch) and are animated by Reanimated, with no extra library.
//
//   const fire = useBurst();
//   <PressableScale onPress={(event) => fire("hearts", event)} />
//
// `fire(preset, where, options)`: `where` is a press event or { x, y } in
// screen coordinates (rain ignores it and falls from the top); `options` can
// carry `emojis`, `colors` and `count`. Nothing happens when the system asks
// to reduce motion.

const BurstContext = createContext(() => {});

export const useBurst = () => useContext(BurstContext);

const pointOf = (where, width, height) => {
  const touch = where?.nativeEvent ?? where;
  const x = touch?.pageX ?? touch?.x;
  const y = touch?.pageY ?? touch?.y;
  return Number.isFinite(x) && Number.isFinite(y)
    ? { x, y }
    : { x: width / 2, y: height / 3 };
};

const Piece = ({ spec }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(
        spec.delay,
        withTiming(1, { duration: spec.duration, easing: Easing.linear }),
      ),
    );
  }, [progress, spec.delay, spec.duration]);

  const animated = useAnimatedStyle(() => {
    const t = progress.value;
    const out = 1 - (1 - t) * (1 - t);
    const x =
      spec.x0 + spec.dx * out + Math.sin(t * spec.waves * 2 * Math.PI) * spec.sway;
    const y = spec.y0 - spec.up * out + spec.fall * t * t;
    return {
      opacity: t <= 0 ? 0 : t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${spec.rotate * t}deg` },
        { scale: 0.5 + 0.5 * Math.min(1, t * 6) },
      ],
    };
  });

  if (spec.glyph) {
    return (
      <Animated.Text
        allowFontScaling={false}
        style={[styles.piece, { fontSize: spec.w }, animated]}
      >
        {spec.glyph}
      </Animated.Text>
    );
  }
  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: spec.w,
          height: spec.h,
          backgroundColor: spec.color,
          borderRadius: spec.round ? spec.w / 2 : 2,
        },
        animated,
      ]}
    />
  );
};

export const BurstProvider = ({ children }) => {
  const paperTheme = usePaperTheme();
  const reduceMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [bursts, setBursts] = useState([]);
  const layer = useRef(null);
  const lastId = useRef(0);
  const timers = useRef(new Set());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const palette = useMemo(() => {
    const { colors } = paperTheme;
    return [
      colors.chartCoral,
      colors.chartBlue,
      colors.chartTeal,
      colors.chartAmber,
      colors.chartPurple,
      colors.chartPink,
    ].filter(Boolean);
  }, [paperTheme]);

  const fire = useCallback(
    (preset, where, options = {}) => {
      if (reduceMotion) return;
      lastId.current += 1;
      const id = lastId.current;
      const particles = makeParticles(preset, {
        seed: id * 7919,
        width,
        height,
        colors: palette,
        ...options,
      });
      if (particles.length === 0) return;
      const point = preset === "rain" ? { x: width / 2, y: 0 } : pointOf(where, width, height);

      const add = (offsetX, offsetY) => {
        setBursts((current) => [
          ...current,
          { id, x: point.x - offsetX, y: point.y - offsetY, particles },
        ]);
        const timer = setTimeout(() => {
          timers.current.delete(timer);
          setBursts((current) => current.filter((burst) => burst.id !== id));
        }, burstLength(particles) + 200);
        timers.current.add(timer);
      };

      // The layer may not start at the corner of the window (a status bar, a
      // frame): take its position into account.
      if (layer.current?.measureInWindow) {
        layer.current.measureInWindow((x, y) => add(x || 0, y || 0));
      } else {
        add(0, 0);
      }
    },
    [reduceMotion, width, height, palette],
  );

  return (
    <BurstContext.Provider value={fire}>
      {children}
      <View ref={layer} pointerEvents="none" style={styles.layer}>
        {bursts.map((burst) => (
          <View
            key={burst.id}
            pointerEvents="none"
            style={[styles.origin, { left: burst.x, top: burst.y }]}
          >
            {burst.particles.map((spec) => (
              <Piece key={spec.id} spec={spec} />
            ))}
          </View>
        ))}
      </View>
    </BurstContext.Provider>
  );
};

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  origin: { position: "absolute", width: 0, height: 0 },
  piece: { position: "absolute" },
});

export default BurstProvider;
