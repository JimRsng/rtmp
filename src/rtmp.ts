import { join } from "node:path";
import { spawn } from "node:child_process";
import NodeMediaServer from "node-media-server";
import { install } from "cloudflared";
import { getDirs, startDirs } from "./utils/helpers.ts";
import { installFFmpeg } from "./utils/ffmpeg-install.ts";

export const runRtmp = async (token: string): Promise<void> => {
  await startDirs();
  const { runtimeDir, mediaDir } = await getDirs();
  const cloudflaredBin = join(runtimeDir, process.platform === "win32" ? "cloudflared.exe" : "cloudflared");
  const ffmpegBin = join(runtimeDir, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
  await installFFmpeg({ target: process.platform === "win32" ? "ffmpeg-win32-x64" : "ffmpeg-linux-x64" });
  await install(cloudflaredBin);
  spawn(cloudflaredBin, ["--version"], { stdio: "inherit" });
  const nms = new NodeMediaServer({
    // @ts-expect-error No bind type
    bind: "127.0.0.1",
    rtmp: {
      port: 5740,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60
    }
  });

  nms.run();

  // @ts-expect-error
  nms.on("prePublish", (session: { streamHost: string, streamPath: string }) => {
    const { streamHost, streamPath } = session;
    const ff = spawn(ffmpegBin, [
      "-i", `rtmp://${streamHost}:5740${streamPath}`,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "28",
      "-c:a", "aac",
      "-b:a", "128k",
      "-fflags", "nobuffer",
      "-flags", "low_delay",
      "-tune", "zerolatency",
      "-f", "hls",
      "-hls_time", "1",
      "-hls_list_size", "10",
      "-hls_flags", "delete_segments+append_list",
      "-hls_segment_filename", join(mediaDir, "%03d.ts"),
      join(mediaDir, "index.m3u8")
    ], { stdio: ["ignore", "pipe", "pipe"], shell: false });

    ff.stderr?.on("data", (data) => {
      console.info(`[FFmpeg] ${data.toString()}`);
    });

    ff.stdout?.on("data", (data) => {
      console.info(`[FFmpeg stdout] ${data.toString()}`);
    });

    ff.on("close", (code, signal) => {
      console.warn(`FFmpeg terminó con código ${code}, señal: ${signal}`);
    });

    ff.on("error", (err) => {
      console.error(`FFmpeg error: ${err.message}`);
    });
  });

  spawn(cloudflaredBin, ["tunnel", "run", "--token", token], { stdio: "inherit", shell: false });
};
