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
    return json({ error: "Invalid segment" }, { status: ErrorCode.BAD_REQUEST });
  }

  const isM3U8 = file.includes(".m3u8");
  const filePath = join(Workspace.dirs.media, file);
  let buf = await readFile(filePath, isM3U8 ? "utf8" : undefined).catch(() => null);

  if (!buf) {
    return json({ error: "File not found" }, { status: ErrorCode.NOT_FOUND });
  }

  if (file !== "master.m3u8" && isM3U8 && buf && typeof buf === "string") {
    const lines = buf.trim().split(/\r?\n/);
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i]?.startsWith("#EXTINF:")) {
        lines.splice(i, 2);
        break;
      }
    }
    buf = lines.join("\n");
  }

  return new Response(buf, {
    headers: {
      "Content-Type": file.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/MP2T"
    }
  });
});

export const runHttp = (options: { port: number }) => {
  const ittyServer = createServerAdapter(router.fetch);
  const httpServer = createServer(ittyServer);
  httpServer.listen(options.port);
};
