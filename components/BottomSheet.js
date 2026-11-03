import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Icon, Text, useTheme as usePaperTheme } from "react-native-paper";

const ROW_HEIGHT = 52;

// The dimmed screen closes the sheet and the sheet swallows its own taps. On a
// phone both are Pressables, which is what makes a tap outside reliable. On web
// a Pressable is a <button>, and a button cannot hold other buttons (the rows),
// so there they are plain views with a click handler.
const IS_WEB = Platform.OS === "web";
const Backdrop = ({ onClose, style, children }) =>
  IS_WEB ? (
    <View style={style} onClick={onClose}>
      {children}
    </View>
  ) : (
    <Pressable
      style={style}
      onPress={onClose}
      accessibilityRole="button"
      accessibilityLabel="Cerrar"
    >
      {children}
    </Pressable>
  );
const Panel = ({ style, children }) =>
  IS_WEB ? (
    <View
      style={style}
      onClick={(event) => event.stopPropagation()}
      accessibilityViewIsModal
    >
      {children}
    </View>
  ) : (
    <Pressable
      style={style}
      onPress={() => {}}
      accessible={false}
      accessibilityViewIsModal
    >
      {children}
    </Pressable>
  );

// A sheet that rises from the bottom. It is a native Modal on purpose: the
// Android back button, a tap on the dimmed screen and a "Cancelar" row all close
// it, and it does not depend on measuring a button or on a floating overlay
// (Paper's Menu stayed open on a real phone). Taps on the sheet itself are
// swallowed so they do not close it. `scroll` lets tall content scroll inside,
// and `footer` (a Cancel row) stays fixed under it.
const BottomSheet = ({
  visible,
  onClose,
  title,
  children,
  footer,
  scroll = false,
}) => {
  const paperTheme = usePaperTheme();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Backdrop style={styles.root} onClose={onClose}>
        <Panel style={[styles.sheet, { backgroundColor: paperTheme.colors.surface }]}>
          {title ? (
            <Text
              numberOfLines={1}
              accessibilityRole="header"
              style={[styles.title, { color: paperTheme.colors.onSurfaceVariant }]}
            >
              {title}
            </Text>
          ) : null}
          {scroll ? (
            <ScrollView
              style={{ maxHeight: height * 0.72 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
          {footer}
        </Panel>
      </Backdrop>
    </Modal>
  );
};

// One tappable line of a sheet: an icon, a label and, when `selected`, a check.
export const SheetRow = ({
  icon,
  label,
  onPress,
  destructive = false,
  selected = false,
  disabled = false,
}) => {
  const paperTheme = usePaperTheme();
  const color = destructive ? paperTheme.colors.error : paperTheme.colors.onSurface;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.row,
        disabled && styles.disabled,
        pressed && { backgroundColor: paperTheme.colors.surfaceVariant },
      ]}
    >
      {icon ? <Icon source={icon} size={24} color={color} /> : null}
      <Text
        style={[
          styles.rowLabel,
          { color, fontWeight: selected ? "800" : "400" },
        ]}
      >
        {label}
      </Text>
      {selected ? (
        <Icon source="check" size={22} color={paperTheme.colors.primary} />
      ) : null}
    </Pressable>
  );
};

export const SheetCancel = ({ onPress, label = "Cancelar" }) => {
  const paperTheme = usePaperTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.row,
        styles.cancel,
        { borderTopColor: paperTheme.colors.outlineVariant },
        pressed && { backgroundColor: paperTheme.colors.surfaceVariant },
      ]}
    >
      <Text style={{ color: paperTheme.colors.primary, fontWeight: "700", fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    fontSize: 13,
    fontWeight: "700",
  },
  row: {
    minHeight: ROW_HEIGHT,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rowLabel: { flex: 1, fontSize: 16 },
  disabled: { opacity: 0.5 },
  cancel: {
    justifyContent: "center",
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default BottomSheet;
