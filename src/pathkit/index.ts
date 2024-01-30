import PathKitInit from "pathkit-wasm/bin/pathkit";
import wasm from "pathkit-wasm/bin/pathkit.wasm?url";

let _PathKit: PathKit.PathKitApi;
export function getPathKit(): PathKit.PathKitApi {
  if (!_PathKit) {
    throw Error("PathKit not loaded");
  }
  return _PathKit;
}

PathKitInit({ locateFile: () => wasm }).then((PathKit) => {
  _PathKit = PathKit;
});
