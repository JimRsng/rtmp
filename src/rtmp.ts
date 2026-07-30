import { join } from "node:path";
import { spawn } from "node:child_process";
import NodeMediaServer from "node-media-server";
import { install } from "cloudflared";
import { Workspace } from "./utils/workspace.ts";
import { installFFmpeg } from "./utils/ffmpeg-install.ts";

export const runRtmp = async (options: { token?: string, port: number }): Promise<void> => {
  const isWindows = process.platform === "win32";

  const cloudflaredBin = join(Workspace.path, isWindows ? "cloudflared.exe" : "cloudflared");
  const ffmpegBin = join(Workspace.path, isWindows ? "ffmpeg.exe" : "ffmpeg");

  await installFFmpeg({ target: isWindows ? "ffmpeg-win32-x64" : "ffmpeg-linux-x64" });

  const nms = new NodeMediaServer({
    // @ts-expect-error No bind type
    bind: "127.0.0.1",
    rtmp: {
      port: options.port,
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
      "-i", `rtmp://${streamHost}:${options.port}${streamPath}`,

      "-filter_complex",
      "[0:v]split=2[v1080][v720];" +
      "[v720]scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2," +
      "pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v720out]",

      "-map", "[v1080]", "-map", "0:a:0",
      "-map", "[v720out]", "-map", "0:a:0",

      "-c:v", "libx264",
      "-preset", "veryfast",
      "-tune", "zerolatency",

      "-g", "60",
      "-keyint_min", "60",
      "-sc_threshold", "0",

      "-b:v:0", "4500k", "-maxrate:v:0", "8000k", "-bufsize:v:0", "8000k",

      "-b:v:1", "2500k", "-maxrate:v:1", "3500k", "-bufsize:v:1", "3500k",

      "-c:a", "aac",
      "-b:a:0", "192k",
      "-b:a:1", "128k",

      "-f", "hls",
      "-hls_time", "2",
      "-hls_list_size", "5",
      "-hls_flags", "delete_segments+append_list+independent_segments",

      "-hls_segment_filename",
      join(Workspace.dirs.media, "%v_%01d.ts"),

      "-master_pl_name",
      "master.m3u8",

      "-var_stream_map",
      "v:0,a:0,name:1080p v:1,a:1,name:720p",

      join(Workspace.dirs.media, "%v.m3u8")
    ], { stdio: ["ignore", "pipe", "pipe"], shell: false });

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

  if (options.token) {
    await install(cloudflaredBin);
    spawn(cloudflaredBin, ["--version"], { stdio: "inherit" });
    spawn(cloudflaredBin, ["tunnel", "run", "--token", options.token], { stdio: "inherit", shell: false });
  }
};
