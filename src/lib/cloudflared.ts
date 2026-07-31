import { join } from "node:path";
import { spawn } from "node:child_process";
import { install } from "cloudflared";
import { consola } from "consola";
import { Workspace } from "../utils/workspace.ts";

export interface CloudflaredOptions {
  token: string;
}

export const startCloudflared = async (options: CloudflaredOptions) => {
  const isWindows = process.platform === "win32";

  const cloudflaredBin = join(Workspace.path, isWindows ? "cloudflared.exe" : "cloudflared");
  await install(cloudflaredBin);

  spawn(cloudflaredBin, ["--version"], { stdio: "pipe", shell: false }).stdout.on("data", (data: Buffer) => consola.info(data.toString()));
  spawn(cloudflaredBin, ["tunnel", "run", "--token", options.token], { stdio: "inherit", shell: false });
};
