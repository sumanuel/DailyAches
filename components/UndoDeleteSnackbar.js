import React, { useContext } from "react";
import { Snackbar } from "react-native-paper";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";
import { DELETE_UNDO_MS } from "../context/useRemoteData";

// Approximate height of the bottom tab bar, so the message sits above it.
const TAB_BAR_HEIGHT = 64;

// "Registro eliminado · Deshacer" while a delete can still be undone, and a
// short message when the server refused it (the record is then restored).
const UndoDeleteSnackbar = () => {
  const { pendingDeletion, deleteError, undoDeleteRecord, dismissDeleteError } =
    useUser();
  // The context (not the hook) is read so a missing provider just means no inset.
  const insets = useContext(SafeAreaInsetsContext);
  const wrapperStyle = { bottom: TAB_BAR_HEIGHT + (insets?.bottom ?? 0) };

  return (
    <>
      <Snackbar
        visible={Boolean(pendingDeletion)}
        // The hook decides when the delete happens; the snackbar only mirrors it.
        onDismiss={() => {}}
        duration={DELETE_UNDO_MS + 1000}
        wrapperStyle={wrapperStyle}
        action={{ label: "Deshacer", onPress: undoDeleteRecord }}
      >
        Registro eliminado
      </Snackbar>
      <Snackbar
        visible={Boolean(deleteError)}
        onDismiss={dismissDeleteError}
        duration={5000}
        wrapperStyle={wrapperStyle}
      >
        {deleteError}
      </Snackbar>
    </>
  );
};

export default UndoDeleteSnackbar;
