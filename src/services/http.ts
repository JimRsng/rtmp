import { createServerAdapter } from "@whatwg-node/server";
import { createServer } from "node:http";
import { AutoRouter, cors, json } from "itty-router";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import consola from "consola";
import { Workspace } from "../utils/workspace.ts";
import { ErrorCode } from "../utils/errors.ts";
import { infoSocket, runWebSocket } from "./ws.ts";
import { liveInfo } from "../lib/ffmpeg.ts";

const { preflight, corsify } = cors({ origin: "*" });

const router = AutoRouter({
  before: [preflight],
  finally: [corsify]
});

const stream = (filePath: string, headers: Record<string, string>) => {
  const fileStream = createReadStream(filePath);
  return new Promise<Response>((resolve) => {
    fileStream.once("open", () => {
      resolve(new Response(Readable.toWeb(fileStream) as ReadableStream, { headers }));
    });

    fileStream.once("error", () => {
      resolve(json({ error: "File not found" }, { status: ErrorCode.NOT_FOUND }));
      fileStream.destroy();
    });
  });
};

router.get("/live", () => json({ ...liveInfo, viewerCount: infoSocket.viewerCount }));

router.get("/live/:sessionId/master.m3u8", (req) => {
  const { sessionId } = req.params as { sessionId: string };
  const filePath = join(Workspace.dirs.media, sessionId, "master.m3u8");
  return stream(filePath, {
    "Content-Type": "application/vnd.apple.mpegurl",
    "Cache-Control": "no-cache"
  });
});

router.get("/live/:sessionId/:quality/:file", async (req) => {
  const { sessionId, quality, file } = req.params as { sessionId: string, quality: string, file: string };
  if (!/^[\w-]+\.(ts|m3u8)$/.test(file)) {
    return json({ error: "Request not allowed" }, { status: ErrorCode.BAD_REQUEST });
  }

  const filePath = join(Workspace.dirs.media, sessionId, quality, file);
  const isPlaylist = file.endsWith(".m3u8");

  return stream(filePath, {
    "Content-Type": isPlaylist ? "application/vnd.apple.mpegurl" : "video/mp2t",
    "Cache-Control": isPlaylist ? "no-cache" : "public, max-age=86400"
  });
});

export const runHttp = (options: { port: number }) => {
  const ittyServer = createServerAdapter(router.fetch);
  const httpServer = createServer(ittyServer);
  runWebSocket({ server: httpServer });
  httpServer.listen(options.port);
  consola.ready(`HTTP + WS server listo en puerto ${options.port}`);
};
