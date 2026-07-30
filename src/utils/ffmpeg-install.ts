import { $fetch } from "ofetch";
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { createGunzip } from "node:zlib";
import { Workspace } from "./workspace.ts";

export async function installFFmpeg ({ target }: { target: string }) {
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
}
