import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text, useTheme as usePaperTheme } from "react-native-paper";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

// A short confirmation that rises above the tab bar and goes away by itself:
//
//   const toast = useToast();
//   toast("Registro guardado", "Cabeza de Ana · intensidad 7");
//
// It never takes touches. It stays mounted only while it shows (a leaving
// animation would cut short on web), and it is announced to screen readers.

const SHOW_MS = 2800;
const ABOVE_TAB_BAR = 84;

const ToastContext = createContext(() => {});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const paperTheme = usePaperTheme();
  const insets = useContext(SafeAreaInsetsContext);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const count = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback((title, detail) => {
    clearTimeout(timer.current);
    count.current += 1;
    setToast({ id: count.current, title, detail });
    timer.current = setTimeout(() => setToast(null), SHOW_MS);
  }, []);

  const { colors } = paperTheme;
  const background = colors.inverseSurface || colors.onSurface;
  const foreground = colors.inverseOnSurface || colors.surface;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <View
          pointerEvents="none"
          style={[styles.wrapper, { bottom: (insets?.bottom ?? 0) + ABOVE_TAB_BAR }]}
        >
          <Animated.View
            key={toast.id}
            entering={FadeInDown.springify().damping(16)}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[styles.toast, { backgroundColor: background }]}
          >
            <Text allowFontScaling={false} style={styles.icon}>
              ✅
            </Text>
            <View style={styles.texts}>
              <Text variant="titleSmall" style={[styles.title, { color: foreground }]}>
                {toast.title}
              </Text>
              {toast.detail ? (
                <Text style={{ color: foreground }}>{toast.detail}</Text>
              ) : null}
            </View>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 900,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    maxWidth: 480,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: { fontSize: 22 },
  texts: { flexShrink: 1 },
  title: { fontWeight: "800" },
});

export default ToastProvider;
