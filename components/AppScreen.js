import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";

const AppScreen = ({
  children,
  contentContainerStyle,
  style,
  scroll = true,
  keyboardOffset = 0,
}) => {
  const paperTheme = usePaperTheme();
  const Container = scroll ? ScrollView : View;
  const containerProps = scroll
    ? {
        style: styles.fill,
        contentContainerStyle: [styles.content, contentContainerStyle],
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: "handled",
        keyboardDismissMode: Platform.OS === "ios" ? "interactive" : "on-drag",
      }
    : {
        style: [styles.fill, styles.content, contentContainerStyle],
      };

  return (
    <KeyboardAvoidingView
      style={[
        styles.root,
        { backgroundColor: paperTheme.colors.background },
        style,
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardOffset}
    >
      <View
        style={[
          styles.topGlow,
          { backgroundColor: paperTheme.colors.heroBackdrop },
        ]}
      />
      <View
        style={[
          styles.sideGlow,
          { backgroundColor: paperTheme.colors.accentBerry },
        ]}
      />
      <Container {...containerProps}>{children}</Container>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  fill: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  topGlow: {
    position: "absolute",
    top: -110,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 999,
    opacity: 0.6,
  },
  sideGlow: {
    position: "absolute",
    top: 180,
    right: -70,
    width: 180,
    height: 180,
    borderRadius: 999,
    opacity: 0.35,
  },
});

export default AppScreen;
