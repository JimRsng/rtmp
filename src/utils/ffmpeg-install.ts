import { ofetch } from "ofetch";
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { createGunzip } from "node:zlib";
import { getDirs } from "./helpers.ts";

export async function installFFmpeg ({ target }: { target: string }) {
  const { runtimeDir } = await getDirs();
  const url = `https://github.com/eugeneware/ffmpeg-static/releases/download/b6.1.1/${target}.gz`;
  const response = await ofetch(url, { responseType: "stream" });
  const gzFile = `${runtimeDir}/ffmpeg.gz`;
  await pipeline(response, createWriteStream(gzFile));
  await pipeline(
    createReadStream(gzFile),
    createGunzip(),
    createWriteStream(`${runtimeDir}/ffmpeg.exe`)
  );
  await unlink(gzFile);
}