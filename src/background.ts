import OBR, { Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

import { addItems } from "./addItems";

OBR.onReady(() => {
  OBR.contextMenu.create({
    id: getPluginId("create-menu"),
    icons: [
      {
        icon: "/create.svg",
        label: "Create Prefab",
        filter: {
          roles: ["GM"],
        },
      },
    ],
    onClick(_) {
      OBR.modal.open({
        id: getPluginId("prefab-form"),
        url: "/",
        height: 197,
        width: 250,
      });
    },
  });

  OBR.contextMenu.create({
    id: getPluginId("insert-menu"),
    icons: [
      {
        icon: "/insert.svg",
        label: "Insert Prefab",
        filter: {
          roles: ["GM"],
          min: 0,
          max: 0,
        },
      },
    ],
    onClick(context) {
      OBR.player.deselect();
      OBR.assets.downloadScenes(true, `"Prefab"`).then((scenes) => {
        const items: Item[] = [];
        for (const scene of scenes) {
          items.push(...scene.items);
        }
        if (items.length > 0) {
          addItems(items, context.selectionBounds.center);
        }
      });
    },
  });
});
