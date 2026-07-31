import { join } from "node:path";
import { spawn } from "node:child_process";
import { install } from "cloudflared";
import { consola } from "consola";
import { Workspace } from "../utils/workspace.ts";

export const startCloudflared = async (options: { token: string }): Promise<void> => {
  const isWindows = process.platform === "win32";

  const cloudflaredBin = join(Workspace.path, isWindows ? "cloudflared.exe" : "cloudflared");
  await install(cloudflaredBin);

  spawn(cloudflaredBin, ["--version"], { stdio: "pipe", shell: false }).stdout.on("data", (data: Buffer) => consola.info(data.toString()));
  spawn(cloudflaredBin, ["tunnel", "run", "--token", options.token], { stdio: "inherit", shell: false });
};
