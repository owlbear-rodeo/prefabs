namespace PathKit {
  export class SkPath {
    protected constructor();

    getBounds(): SkRect;

    delete();
  }

  export interface SkRect {
    fLeft: number;
    fTop: number;
    fRight: number;
    fBottom: number;
  }

  export type PathKitApi = {
    FromCmds: (cmds: Array<Array<Number>>) => PathKit.SkPath;
  };
}

declare module "pathkit-wasm";

declare module "pathkit-wasm/bin/pathkit" {
  type PathKitInit = (options: {
    locateFile?: () => string;
  }) => Promise<PathKit.PathKitApi>;

  const init: PathKitInit;

  export default init;
}
