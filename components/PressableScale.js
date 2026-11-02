import React, { useEffect, useRef } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_SPRING = { damping: 18, stiffness: 320 };
const POP_SCALE = 1.08;

// A pressable that sinks slightly while held and, with `pop`, bounces once when
// `pop` turns true (a selection made). Reanimated skips the motion by itself
// when the system asks to reduce it.
const PressableScale = ({
  pressedScale = 0.96,
  pop = false,
  style,
  onPressIn,
  onPressOut,
  children,
  ...props
}) => {
  const scale = useSharedValue(1);
  const wasPopped = useRef(pop);

  useEffect(() => {
    if (pop && !wasPopped.current) {
      scale.set(
        withSequence(
          withTiming(POP_SCALE, { duration: 90 }),
          withSpring(1, PRESS_SPRING),
        ),
      );
    }
    wasPopped.current = pop;
  }, [pop, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        scale.set(withSpring(pressedScale, PRESS_SPRING));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, PRESS_SPRING));
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};

export default PressableScale;
