import { type CloudflaredOptions, startCloudflared } from "./lib/cloudflared.ts";
import { type FfmpegOptions, startFFmpeg } from "./lib/ffmpeg.ts";

interface RtmpOptions extends FfmpegOptions {
  cloudflared?: CloudflaredOptions;
}

export const runRtmp = async (options: RtmpOptions) => {
  startFFmpeg({
    host: options.host,
    port: options.port
  });

  if (options.cloudflared) {
    await startCloudflared({
      token: options.cloudflared.token
    });
  }
};
