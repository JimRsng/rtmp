import { $fetch } from "ofetch";
import { consola } from "consola";
import { colors } from "consola/utils";
import pkg from "../../package.json" with { type: "json" };

export const APP = {
  name: `jim-${pkg.name}`,
  version: pkg.version,
  repository: {
    owner: "JimRsng",
    name: pkg.name
  }
};

export const checkForUpdates = async () => {
  const slug = `${APP.repository.owner}/${APP.repository.name}`;
  const response = await $fetch(`https://api.github.com/repos/${slug}/releases/latest`);

  const latest = response.tag_name;
  const current = `v${APP.version}`;

  if (latest !== current) {
    const updateBox = ""
      + `Nueva versión disponible! ${colors.red(current)} → ${colors.green(latest)}.\n`
      + `Descargar: ${colors.cyan(`https://github.com/${slug}/releases/download/${latest}/${APP.name}-${latest}.exe`)}`;
    consola.box(updateBox);
  }
};
