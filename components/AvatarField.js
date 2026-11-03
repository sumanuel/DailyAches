import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import BottomSheet, { SheetCancel, SheetRow } from "./BottomSheet";
import PersonAvatar from "./PersonAvatar";
import {
  avatarIllustrationKeys,
  getAvatarIllustration,
  resolveAvatarIllustrationKey,
} from "../constants/illustrations";
import { isPhotoAvatar } from "../utils/avatars";
import { choosePhoto, takePhoto } from "../utils/photoService";

// The picture of a person: shows the current one and opens a sheet to take a
// photo, pick one from the gallery or choose one of the drawn avatars.
// `value` is an avatar name or a photo data URI (see utils/avatars.js).
const AvatarField = ({ value, onChange, style }) => {
  const paperTheme = usePaperTheme();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const photo = isPhotoAvatar(value);
  const label = photo
    ? "Foto"
    : getAvatarIllustration(resolveAvatarIllustrationKey(value)).label;

  const openSheet = () => {
    setError("");
    setOpen(true);
  };
  const closeSheet = () => {
    if (!busy) setOpen(false);
  };

  const fromPhone = async (get) => {
    setBusy(true);
    setError("");
    const result = await get();
    setBusy(false);
    if (result.success) {
      onChange(result.photo);
      setOpen(false);
    } else if (!result.cancelled) {
      setError(result.error);
    }
  };

  const chooseDrawn = (key) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <View style={style}>
      <Text variant="titleMedium" style={styles.title}>
        Avatar
      </Text>
      <View style={styles.current}>
        <PersonAvatar avatar={value} size={72} />
        <View style={styles.currentCopy}>
          <Text style={styles.currentLabel}>{label}</Text>
          <Button
            mode="outlined"
            icon="image-edit-outline"
            onPress={openSheet}
            style={styles.changeButton}
            accessibilityLabel="Cambiar foto o avatar"
          >
            Cambiar
          </Button>
        </View>
      </View>

      <BottomSheet
        visible={open}
        onClose={closeSheet}
        title="Foto o avatar"
        scroll
        footer={<SheetCancel onPress={closeSheet} label="Cerrar" />}
      >
        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.error, { color: paperTheme.colors.error }]}
          >
            {error}
          </Text>
        ) : null}
        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator />
            <Text>Preparando la foto…</Text>
          </View>
        ) : (
          <>
            {Platform.OS === "web" ? null : (
              <SheetRow
                icon="camera-outline"
                label="Tomar foto"
                onPress={() => fromPhone(takePhoto)}
              />
            )}
            <SheetRow
              icon="image-multiple-outline"
              label="Elegir de la galería"
              onPress={() => fromPhone(choosePhoto)}
            />
          </>
        )}

        <Text
          style={[styles.sectionLabel, { color: paperTheme.colors.onSurfaceVariant }]}
        >
          O ELIGE UN AVATAR
        </Text>
        <View style={styles.grid}>
          {avatarIllustrationKeys.map((key) => {
            const selected = !photo && value === key;
            return (
              <Pressable
                key={key}
                disabled={busy}
                onPress={() => chooseDrawn(key)}
                accessibilityRole="button"
                accessibilityLabel={getAvatarIllustration(key).label}
                accessibilityState={{ selected }}
                style={[
                  styles.tile,
                  {
                    backgroundColor: selected
                      ? paperTheme.colors.primaryContainer
                      : paperTheme.colors.surfaceVariant,
                    borderColor: selected ? paperTheme.colors.primary : "transparent",
                  },
                ]}
              >
                <PersonAvatar avatar={key} size={52} selected={selected} />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tileLabel,
                    {
                      color: selected
                        ? paperTheme.colors.onPrimaryContainer
                        : paperTheme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {getAvatarIllustration(key).label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { marginBottom: 12, fontWeight: "600" },
  current: { flexDirection: "row", alignItems: "center", gap: 16 },
  currentCopy: { flex: 1, gap: 8, alignItems: "flex-start" },
  currentLabel: { fontSize: 15, fontWeight: "700" },
  changeButton: { borderRadius: 16 },
  error: { paddingHorizontal: 24, paddingBottom: 8, lineHeight: 20 },
  busy: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  sectionLabel: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  tile: {
    width: "30%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 2,
    gap: 6,
  },
  tileLabel: { fontSize: 11, fontWeight: "700", textAlign: "center" },
});

export default AvatarField;
