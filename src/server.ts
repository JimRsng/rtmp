import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import NodeMediaServer from "node-media-server";
import { install } from "cloudflared";

export const runServer = async (token: string): Promise<void> => {
  const runtimeDir = path.join(process.env.LOCALAPPDATA || os.tmpdir(), "jim-rtmp");
  console.info(runtimeDir);
  fs.mkdirSync(runtimeDir, { recursive: true });
  const cloudflaredBin = path.join(runtimeDir, process.platform === "win32" ? "cloudflared.exe" : "cloudflared");
  await install(cloudflaredBin);
  spawn(cloudflaredBin, ["--version"], { stdio: "inherit" });
  const nms = new NodeMediaServer({
    rtmp: {
      port: 5740,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60
    },
    http: {
      port: 8080,
      mediaroot: "./media",
      allow_origin: "*"
    }
  });

  nms.run();

  spawn(cloudflaredBin, ["tunnel", "run", "--token", token], { stdio: "inherit", shell: false });
};
