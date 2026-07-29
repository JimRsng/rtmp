import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const startDirs = async () => {
  const { runtimeDir, mediaDir } = await getDirs();
  await mkdir(runtimeDir, { recursive: true });
  await rm(mediaDir, { recursive: true, force: true }).catch(() => null);
  await mkdir(mediaDir, { recursive: true });
};

export const getDirs = async () => {
  const runtimeDir = join(process.env.LOCALAPPDATA || tmpdir(), "jim-rtmp");
  const mediaDir = join(runtimeDir, "media");
  return { runtimeDir, mediaDir };
};
