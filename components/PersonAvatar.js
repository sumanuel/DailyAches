import React from "react";
import { Image } from "expo-image";
import { useTheme as usePaperTheme } from "react-native-paper";
import IllustrationBadge from "./IllustrationBadge";
import {
  getAvatarIllustration,
  resolveAvatarIllustrationKey,
} from "../constants/illustrations";
import { isPhotoAvatar } from "../utils/avatars";

// A person's picture: their photo, or one of the drawn avatars. Both are
// rounded squares with the thin gray frame, so they look the same in a list.
const PersonAvatar = ({ avatar, size = 44, selected = false, style }) => {
  const paperTheme = usePaperTheme();

  if (isPhotoAvatar(avatar)) {
    return (
      <Image
        source={{ uri: avatar }}
        contentFit="cover"
        aria-hidden
        style={[
          {
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.34),
            borderWidth: selected ? 2 : 1.5,
            borderColor: selected
              ? paperTheme.colors.primary
              : paperTheme.colors.avatarBorder,
            backgroundColor: paperTheme.colors.surfaceVariant,
          },
          style,
        ]}
      />
    );
  }

  return (
    <IllustrationBadge
      preset={getAvatarIllustration(resolveAvatarIllustrationKey(avatar))}
      size={size}
      avatar
      selected={selected}
      style={style}
    />
  );
};

export default PersonAvatar;
