import { join } from "node:path";
import { spawn } from "node:child_process";
import { install } from "cloudflared";
import { consola } from "consola";
import { Workspace } from "./utils/workspace.ts";
import { installFFmpeg } from "./utils/ffmpeg-install.ts";
import { hlsArgs } from "./utils/ffmpeg.ts";

export const runRtmp = async (options: { token?: string, port: number }): Promise<void> => {
  const isWindows = process.platform === "win32";

  const cloudflaredBin = join(Workspace.path, isWindows ? "cloudflared.exe" : "cloudflared");
  const ffmpegBin = join(Workspace.path, isWindows ? "ffmpeg.exe" : "ffmpeg");

  await installFFmpeg({ target: isWindows ? "ffmpeg-win32-x64" : "ffmpeg-linux-x64" });

  const inputURL = `rtmp://127.0.0.1:${options.port}/live`;
  const ff = spawn(ffmpegBin, [
    "-listen", "1",
    "-i", inputURL,
    ...hlsArgs()
  ], { stdio: ["ignore", "pipe", "pipe"], shell: false });

  ff.stderr.on("data", (data: Buffer) => {
    console.info(`[FFmpeg ffmpeg-only] ${data.toString().trim()}`);
  });

  ff.stdout.on("data", (data: Buffer) => {
    console.info(`[FFmpeg ffmpeg-only stdout] ${data.toString().trim()}`);
  });

  ff.on("close", (code, signal) => {
    console.warn(`FFmpeg (ffmpeg-only) terminó con código ${code}, señal: ${signal}`);
  });

  ff.on("error", (err) => {
    console.error(`FFmpeg (ffmpeg-only) error: ${err.message}`);
  });

  if (options.token) {
    await install(cloudflaredBin);
    spawn(cloudflaredBin, ["--version"], { stdio: "pipe", shell: false }).stdout.on("data", (data: Buffer) => consola.info(data.toString()));
    spawn(cloudflaredBin, ["tunnel", "run", "--token", options.token], { stdio: "inherit", shell: false });
  }
};
