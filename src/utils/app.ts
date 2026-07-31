import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { $fetch } from "ofetch";
import { consola } from "consola";
import { colors } from "consola/utils";
import { Workspace } from "./workspace.ts";
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
  const isUpdateAvailable = latest !== current;

  const downloadUrl = `https://github.com/${slug}/releases/download/${latest}/${APP.name}-${latest}.exe`;

  if (isUpdateAvailable) {
    const updateBox = ""
      + `Nueva versión disponible! ${colors.red(current)} → ${colors.green(latest)}.\n`
      + `Descargar: ${colors.cyan(downloadUrl)}`;
    consola.box(updateBox);
  }

  const updateApp = async () => {
    const execPath = process.execPath;
    const exeDir = dirname(execPath);

    // Define the paths for the old and new executables
    const oldExe = execPath;
    const newExe = join(exeDir, `${APP.name}-${latest}.exe`);

    // Download the new executable
    consola.info(`Descargando nueva versión: ${colors.green(latest)}...`);
    const exeBinary = await $fetch(downloadUrl, { responseType: "stream" });
    await writeFile(newExe, exeBinary);

    // Create a batch file to handle the update process
    const bat = `@echo off
set "OLD_EXE=${oldExe}"
set "NEW_EXE=${newExe}"

taskkill /f /im "%OLD_EXE%" >nul 2>&1

del /f /q "%OLD_EXE%"

start "" "%NEW_EXE%"

exit`;

    // Write the batch file to the workspace and execute it
    await Workspace.instance?.write("update.bat", bat);
    spawn("cmd.exe", ["/c", join(Workspace.path, "update.bat")], {
      detached: true,
      windowsHide: true,
      stdio: "ignore"
    }).unref();

    process.exit(0);
  };

  return {
    updateApp,
    isUpdateAvailable
  };
};
