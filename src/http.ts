import { createServerAdapter } from "@whatwg-node/server";
import { createServer } from "node:http";
import { AutoRouter, cors } from "itty-router"; // ~1kB
import { getDirs } from "./utils/helpers.ts";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const { preflight, corsify } = cors({ origin: "*" });

const router = AutoRouter({
  before: [preflight],
  finally: [corsify]
});

router.get("/live/jimrsng.m3u8", async () => {
  const { mediaDir } = await getDirs();
  const filePath = join(mediaDir, "index.m3u8");
  const buf = await readFile(filePath).catch(() => null);
  if (!buf) {
    return new Response("File not found", { status: 404 });
  }
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl"
    }
  });
});

router.get("/live/:segment", async (req) => {
  const { segment } = req.params as { segment: string };
  const { mediaDir } = await getDirs();
  const filePath = join(mediaDir, segment);
  const buf = await readFile(filePath).catch(() => null);
  if (!buf) {
    return new Response("File not found", { status: 404 });
  }
  return new Response(buf, {
    headers: {
      "Content-Type": "video/MP2T"
    }
  });
});

export const runHttp = () => {
  const ittyServer = createServerAdapter(router.fetch);
  const httpServer = createServer(ittyServer);
  httpServer.listen(8080);
};