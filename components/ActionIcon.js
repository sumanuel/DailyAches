import React from "react";
import { IconButton } from "react-native-paper";

// Icon buttons are small by default (a 20 px icon gives a 36 px target). This
// keeps the touch area at the recommended 44 px and asks for a label, since an
// icon alone tells a screen reader nothing.
export const MIN_TOUCH_TARGET = 44;

const ActionIcon = ({ size = 20, style, accessibilityLabel, ...props }) => {
  if (__DEV__ && !accessibilityLabel) {
    console.warn(`ActionIcon "${props.icon}" has no accessibilityLabel`);
  }
  return (
    <IconButton
      size={size}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: MIN_TOUCH_TARGET,
          height: MIN_TOUCH_TARGET,
          borderRadius: MIN_TOUCH_TARGET / 2,
          margin: 0,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ActionIcon;
