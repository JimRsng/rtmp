import { startCloudflared } from "./lib/cloudflared.ts";
import { startFFmpeg } from "./lib/ffmpeg.ts";

interface RtmpOptions {
  host: string;
  port: number;
  cloudflared?: {
    token: string;
  };
}

export const runRtmp = async (options: RtmpOptions): Promise<void> => {
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
