import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import OBR, { buildSceneUpload } from "@owlbear-rodeo/sdk";
import { useState } from "react";
import { getPluginId } from "./getPluginId";
import thumbnail from "./thumbnail.jpg";

export function App() {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        const name = formJson.name;

        const selection = await OBR.player.getSelection();
        if (!selection || selection.length === 0) {
          OBR.notification.show(
            "Unable to create prefab: no selection",
            "WARNING"
          );
          return;
        }

        try {
          const items = await OBR.scene.items.getItemAttachments(selection);
          const sceneName = `${name.slice(0, 256)} Prefab`;
          const response = await fetch(thumbnail);
          if (!response.ok) {
            throw Error("Unable to fetch scene thumbnail");
          }
          const thumbnailBlob = await response.blob();
          const scene = buildSceneUpload()
            .items(items)
            .name(sceneName)
            .thumbnail(thumbnailBlob)
            .build();
          await OBR.player.deselect();
          await OBR.assets.uploadScenes([scene], true);
        } catch (error) {
          console.error(error);
          if (error instanceof Error) {
            OBR.notification.show(error.message, "ERROR");
          } else {
            OBR.notification.show("Unknown error occurred", "ERROR");
          }
        }

        OBR.modal.close(getPluginId("prefab-form"));
      }}
    >
      <DialogTitle>Create Prefab</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          name="name"
          label="Name"
          fullWidth
          variant="standard"
          autoComplete="off"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">Prefab</InputAdornment>
            ),
            inputProps: {
              // Remove password manager buttons
              ["data-1p-ignore"]: true,
              ["data-lpignore"]: true,
            },
          }}
          disabled={submitting}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            OBR.modal.close(getPluginId("prefab-form"));
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          Create
        </Button>
      </DialogActions>
      <Backdrop open={submitting} unmountOnExit>
        <CircularProgress />
      </Backdrop>
    </form>
  );
}
