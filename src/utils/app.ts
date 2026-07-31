import pkg from "../../package.json" with { type: "json" };

export const APP = {
  name: `jim-${pkg.name}`,
  version: pkg.version
};
