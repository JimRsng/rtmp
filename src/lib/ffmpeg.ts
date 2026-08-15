import { spawn } from "node:child_process";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { createGunzip } from "node:zlib";
import { $fetch } from "ofetch";
import { Workspace } from "../utils/workspace.ts";
import { randomUUID } from "node:crypto";

export const liveInfo = {
  isLive: false,
  sessionId: ""
};

const install = async (target: string) => {
  const url = `https://github.com/eugeneware/ffmpeg-static/releases/download/b6.1.1/${target}.gz`;
  const response = await $fetch(url, { responseType: "stream" });
  const gzFile = `${Workspace.path}/ffmpeg.gz`;
  await pipeline(response, createWriteStream(gzFile));
  await pipeline(
    createReadStream(gzFile),
    createGunzip(),
    createWriteStream(`${Workspace.path}/ffmpeg.exe`)
  );
  await unlink(gzFile);
};

const hlsArgs = (sessionId: string) => [
  "-filter_complex",
  "[0:v]split=1[v720];" +
  "[v720]scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2," +
  "pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v720out]",

  "-map", "[v720out]", "-map", "0:a:0",

  "-c:v", "libx264",
  "-preset", "veryfast",
  "-tune", "zerolatency",
  "-pix_fmt", "yuv420p",

  "-g", "90",
  "-keyint_min", "90",
  "-sc_threshold", "0",
  "-bf", "0",
  "-flags", "+cgop",

  "-b:v:0", "2500k", "-maxrate:v:0", "2500k", "-bufsize:v:0", "5000k",

  "-c:a", "aac",
  "-b:a:0", "192k",
  "-b:a:1", "128k",

  "-f", "hls",
  "-hls_time", "3",
  "-hls_list_size", "300",
  "-hls_flags", "delete_segments+append_list+independent_segments",

  "-hls_segment_filename",
  join(Workspace.dirs.media, `${sessionId}_%v_%01d.ts`),

  "-master_pl_name", `${sessionId}_master.m3u8`,

  "-var_stream_map",
  "v:0,a:0,name:720p",

  join(Workspace.dirs.media, `${sessionId}_%v.m3u8`)
];

export interface FfmpegOptions {
  host: string;
  port: number;
}

const restartFFmpeg = async (options: FfmpegOptions) => {
  await Workspace.instance?.media.clear();
  startFFmpeg(options);
};

export const startFFmpeg = async (options: FfmpegOptions) => {
  const isWindows = process.platform === "win32";

  await install(isWindows ? "ffmpeg-win32-x64" : "ffmpeg-linux-x64");
  const ffmpegBin = join(Workspace.path, isWindows ? "ffmpeg.exe" : "ffmpeg");

  const sessionId = randomUUID();
  liveInfo.sessionId = sessionId;

  const ff = spawn(ffmpegBin, [
    "-listen", "1",
    "-i", `rtmp://${options.host}:${options.port}/live`,
    ...hlsArgs(sessionId)
  ], { stdio: ["ignore", "pipe", "pipe"], shell: false });

  ff.stderr.on("data", (data: Buffer) => {
    if (data.includes("frame=")) {
      liveInfo.isLive = true;
      console.info(`[FFmpeg] ${data}`);
    }
  });

  ff.on("close", (code) => {
    liveInfo.isLive = false;
    console.warn(`[FFmpeg] terminó con código ${code}`);
    setTimeout(async () => await restartFFmpeg(options), 1000);
  });

  ff.on("error", (err) => {
    liveInfo.isLive = false;
    console.error(`[FFmpeg] error: ${err.message}`);
    setTimeout(async () => await restartFFmpeg(options), 1000);
  });

  return ff;
};
