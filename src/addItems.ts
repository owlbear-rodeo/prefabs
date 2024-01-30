import OBR, {
  Curve,
  Image,
  Item,
  Label,
  Line,
  Math2,
  MathM,
  Path,
  Ruler,
  Shape,
  Text,
  Vector2,
  isCurve,
  isImage,
  isLabel,
  isLine,
  isPath,
  isRuler,
  isShape,
  isText,
} from "@owlbear-rodeo/sdk";
import { getPathKit } from "./pathkit";
import { v4 as uuid } from "uuid";

export async function addItems(items: Item[], position: Vector2) {
  const bounds = await getBounds(items);

  // Offset items so they are centered around the input position
  const positionOffset = Math2.subtract(position, bounds.center);

  // Keep a map of old ids to new ids for keeping attachment
  // relationships
  const idMap: Record<string, string> = {};
  for (let item of items) {
    idMap[item.id] = uuid();
  }

  const newItems: Item[] = items.map((item) => {
    const newItem = {
      ...item,
      id: idMap[item.id],
      position: Math2.add(item.position, positionOffset),
    };

    // Carry over attachment to new items
    if (item.attachedTo && item.attachedTo in idMap) {
      newItem.attachedTo = idMap[item.attachedTo];
    }

    return newItem;
  });
  await OBR.scene.items.addItems(newItems);
  await OBR.player.select(newItems.map((item) => item.id));
}

async function getBounds(items: Item[]) {
  const dpi = await OBR.scene.grid.getDpi();
  const points: Vector2[] = [];
  for (const item of items) {
    const bounds = getItemBounds(item, dpi);
    points.push(bounds.min);
    points.push(bounds.max);
  }
  return Math2.boundingBox(points);
}

function getItemBounds(item: Item, dpi: number) {
  if (isImage(item)) {
    return getImageBounds(item, dpi);
  } else if (isCurve(item)) {
    return getCurveBounds(item);
  } else if (isLabel(item)) {
    return getTextBounds(item);
  } else if (isLine(item)) {
    return getLineBounds(item);
  } else if (isPath(item)) {
    return getPathBounds(item);
  } else if (isRuler(item)) {
    return getRulerBounds(item);
  } else if (isShape(item)) {
    return getShapeBounds(item);
  } else if (isText(item)) {
    return getTextBounds(item);
  } else {
    return Math2.boundingBox([item.position]);
  }
}

function getImageBounds(item: Image, dpi: number) {
  const dpiScale = dpi / item.grid.dpi;
  const width = item.image.width * dpiScale * item.scale.x;
  const height = item.image.height * dpiScale * item.scale.y;
  const offsetX = (item.grid.offset.x / item.image.width) * width;
  const offsetY = (item.grid.offset.y / item.image.height) * height;
  const min = {
    x: item.position.x - offsetX,
    y: item.position.y - offsetY,
  };
  const max = { x: min.x + width, y: min.y + height };
  return Math2.boundingBox([min, max]);
}

function getCurveBounds(item: Curve) {
  const transform = MathM.fromItem(item);
  const points: Vector2[] = [];
  for (const point of item.points) {
    const worldPoint = MathM.decompose(
      MathM.multiply(transform, MathM.fromPosition(point))
    ).position;
    points.push(worldPoint);
  }
  return Math2.boundingBox(points);
}

function getLineBounds(item: Line) {
  const transform = MathM.fromItem(item);
  const start = MathM.decompose(
    MathM.multiply(transform, MathM.fromPosition(item.startPosition))
  ).position;
  const end = MathM.decompose(
    MathM.multiply(transform, MathM.fromPosition(item.startPosition))
  ).position;
  return Math2.boundingBox([start, end]);
}

function getPathBounds(item: Path) {
  const pk = getPathKit();
  const path = pk.FromCmds(item.commands);
  const bounds = path.getBounds();
  path.delete();

  const transform = MathM.fromItem(item);
  const start = MathM.decompose(
    MathM.multiply(
      transform,
      MathM.fromPosition({ x: bounds.fLeft, y: bounds.fTop })
    )
  ).position;
  const end = MathM.decompose(
    MathM.multiply(
      transform,
      MathM.fromPosition({ x: bounds.fRight, y: bounds.fBottom })
    )
  ).position;

  return Math2.boundingBox([start, end]);
}

function getRulerBounds(item: Ruler) {
  const transform = MathM.fromItem(item);
  const start = MathM.decompose(
    MathM.multiply(transform, MathM.fromPosition(item.startPosition))
  ).position;
  const end = MathM.decompose(
    MathM.multiply(transform, MathM.fromPosition(item.startPosition))
  ).position;
  return Math2.boundingBox([start, end]);
}

function getShapeBounds(item: Shape) {
  const transform = MathM.fromItem(item);
  const start = MathM.decompose(
    MathM.multiply(transform, MathM.fromPosition({ x: 0, y: 0 }))
  ).position;
  const end = MathM.decompose(
    MathM.multiply(
      transform,
      MathM.fromPosition({ x: item.width, y: item.height })
    )
  ).position;
  return Math2.boundingBox([start, end]);
}

function getTextBounds(item: Text | Label) {
  const transform = MathM.fromItem(item);
  // Use a 100x100 bounding box instead of trying to calculate the proper size
  // This is mainly because that would be hard to do and I don't see many people using text only prefabs
  const start = MathM.decompose(
    MathM.multiply(transform, MathM.fromPosition({ x: 0, y: 0 }))
  ).position;
  const end = MathM.decompose(
    MathM.multiply(transform, MathM.fromPosition({ x: 100, y: 100 }))
  ).position;
  return Math2.boundingBox([start, end]);
}
