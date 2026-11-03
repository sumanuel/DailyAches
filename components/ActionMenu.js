import React, { useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { Icon, Text, useTheme as usePaperTheme } from "react-native-paper";
import ActionIcon from "./ActionIcon";

const ROW_HEIGHT = 52;

// A "more actions" button that opens a bottom sheet. It is a native Modal on
// purpose: the Android back button, a tap outside and "Cancelar" all close it,
// and it does not depend on measuring the button or on a floating overlay
// (Paper's Menu stayed open on a real phone). `actions` is a list of
// { label, icon, onPress }; the last one can be marked `destructive`.
const ActionMenu = ({ title, actions, accessibilityLabel }) => {
  const paperTheme = usePaperTheme();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const run = (action) => () => {
    close();
    action.onPress?.();
  };

  return (
    <>
      <ActionIcon
        icon="dots-vertical"
        onPress={() => setOpen(true)}
        accessibilityLabel={accessibilityLabel || `Más acciones de ${title}`}
      />
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        {/* The whole dimmed screen is the element that closes the sheet, and
            the sheet swallows its own taps so touching it does not close it. */}
        <Pressable
          style={styles.root}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
        >
          <Pressable
            style={[styles.sheet, { backgroundColor: paperTheme.colors.surface }]}
            onPress={() => {}}
            accessible={false}
            accessibilityViewIsModal
          >
            <Text
              numberOfLines={1}
              accessibilityRole="header"
              style={[styles.title, { color: paperTheme.colors.onSurfaceVariant }]}
            >
              {title}
            </Text>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                onPress={run(action)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                style={({ pressed }) => [
                  styles.row,
                  pressed && { backgroundColor: paperTheme.colors.surfaceVariant },
                ]}
              >
                <Icon
                  source={action.icon}
                  size={24}
                  color={
                    action.destructive
                      ? paperTheme.colors.error
                      : paperTheme.colors.onSurface
                  }
                />
                <Text
                  style={{
                    color: action.destructive
                      ? paperTheme.colors.error
                      : paperTheme.colors.onSurface,
                    fontSize: 16,
                  }}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              style={({ pressed }) => [
                styles.row,
                styles.cancel,
                { borderTopColor: paperTheme.colors.outlineVariant },
                pressed && { backgroundColor: paperTheme.colors.surfaceVariant },
              ]}
            >
              <Text style={{ color: paperTheme.colors.primary, fontWeight: "700", fontSize: 16 }}>
                Cancelar
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: { paddingHorizontal: 24, paddingBottom: 8, fontSize: 13, fontWeight: "700" },
  row: {
    minHeight: ROW_HEIGHT,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  cancel: {
    justifyContent: "center",
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default ActionMenu;
