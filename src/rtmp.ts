import consola from "consola";
import { type CloudflaredOptions, startCloudflared } from "./lib/cloudflared.ts";
import { type FfmpegOptions, startFFmpeg } from "./lib/ffmpeg.ts";

interface RtmpOptions extends FfmpegOptions {
  cloudflared?: CloudflaredOptions;
}

export const runRtmp = async (options: RtmpOptions) => {
  const ff = await startFFmpeg({
    host: options.host,
    port: options.port
  });

  ff.once("spawn", () => {
    consola.ready(`RTMP server listo en puerto ${options.port}`);
  });

  if (options.cloudflared) {
    await startCloudflared({
      token: options.cloudflared.token
    });
  }
};
