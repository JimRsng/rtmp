import { createServerAdapter } from "@whatwg-node/server";
import { createServer } from "node:http";
import { AutoRouter, cors, json } from "itty-router";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Workspace } from "./utils/workspace.ts";
import { ErrorCode } from "./utils/errors.ts";

const { preflight, corsify } = cors({ origin: "*" });

const router = AutoRouter({
  before: [preflight],
  finally: [corsify]
});

router.get("/live/:file", async (req) => {
  const { file } = req.params as { file: string };
  if (!/^[\w-]+\.(ts|m3u8)$/.test(file)) {
    return json({ error: "Request not allowed" }, { status: ErrorCode.BAD_REQUEST });
  }
  const filePath = join(Workspace.dirs.media, file);
  const buf = await readFile(filePath).catch(() => null);
  if (!buf) {
    return json({ error: "File not found" }, { status: ErrorCode.NOT_FOUND });
  }
  return new Response(buf, {
    headers: {
      "Content-Type": file.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/MP2T",
      "Cache-Control": file.endsWith(".m3u8") ? "no-cache" : "public, max-age=86400"
    }
  });
});

export const runHttp = (options: { port: number }) => {
  const ittyServer = createServerAdapter(router.fetch);
  const httpServer = createServer(ittyServer);
  httpServer.listen(options.port);
};
