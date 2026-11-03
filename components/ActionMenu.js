import React, { useState } from "react";
import ActionIcon from "./ActionIcon";
import BottomSheet, { SheetCancel, SheetRow } from "./BottomSheet";

// A "more actions" button that opens a bottom sheet (see BottomSheet for why it
// is not Paper's Menu). `actions` is a list of { label, icon, onPress }; any of
// them can be marked `destructive`.
const ActionMenu = ({ title, actions, accessibilityLabel }) => {
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
      <BottomSheet visible={open} onClose={close} title={title}>
        {actions.map((action) => (
          <SheetRow
            key={action.label}
            icon={action.icon}
            label={action.label}
            destructive={action.destructive}
            onPress={run(action)}
          />
        ))}
        <SheetCancel onPress={close} />
      </BottomSheet>
    </>
  );
};

export default ActionMenu;
