import { join } from "node:path";
import { spawn } from "node:child_process";
import NodeMediaServer from "node-media-server";
import { install } from "cloudflared";
import { getDirs, setupDirs } from "./utils/helpers.ts";
import { installFFmpeg } from "./utils/ffmpeg-install.ts";

export const runRtmp = async (token: string, options: { port: number }): Promise<void> => {
  const isWindows = process.platform === "win32";

  await setupDirs();
  const { runtimeDir, mediaDir } = await getDirs();

  const cloudflaredBin = join(runtimeDir, isWindows ? "cloudflared.exe" : "cloudflared");
  const ffmpegBin = join(runtimeDir, isWindows ? "ffmpeg.exe" : "ffmpeg");

  await installFFmpeg({ target: isWindows ? "ffmpeg-win32-x64" : "ffmpeg-linux-x64" });
  await install(cloudflaredBin);

  spawn(cloudflaredBin, ["--version"], { stdio: "inherit" });

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

      // 3 calidades: 1080p, 720p, 480p
      "-filter_complex",
      "[0:v]split=3[v1080][v720][v480];" +
      "[v1080]scale=1920:1080:force_original_aspect_ratio=decrease:force_divisible_by=2," +
      "pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v1080out];" +
      "[v720]scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2," +
      "pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v720out];" +
      "[v480]scale=854:480:force_original_aspect_ratio=decrease:force_divisible_by=2," +
      "pad=854:480:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v480out]",

      "-map", "[v1080out]", "-map", "0:a:0",
      "-map", "[v720out]", "-map", "0:a:0",
      "-map", "[v480out]", "-map", "0:a:0",

      "-c:v", "libx264",
      "-preset", "faster",
      "-tune", "zerolatency",

      "-b:v:0", "4500k", "-maxrate:v:0", "8000k", "-bufsize:v:0", "14000k",
      "-b:v:1", "2500k", "-maxrate:v:1", "3500k", "-bufsize:v:1", "6000k",
      "-b:v:2", "1200k", "-maxrate:v:2", "1800k", "-bufsize:v:2", "2800k",

      "-c:a", "aac",
      "-b:a:0", "192k",
      "-b:a:1", "128k",
      "-b:a:2", "96k",

      "-fflags", "nobuffer",
      "-flags", "low_delay",

      "-f", "hls",
      "-hls_time", "1",
      "-hls_list_size", "10",
      "-hls_flags", "delete_segments+append_list+independent_segments",

      "-hls_segment_filename", join(mediaDir, "stream_%v_%03d.ts"),
      "-master_pl_name", "master.m3u8",
      "-var_stream_map", "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p",
      join(mediaDir, "index_%v.m3u8")
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

  // spawn(cloudflaredBin, ["tunnel", "run", "--token", token], { stdio: "inherit", shell: false });
};
