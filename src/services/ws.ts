import type { Server } from "node:http";
import TrackerServer from "bittorrent-tracker/server";
import { parseURL } from "ufo";
import { Server as InfoServer } from "../utils/info-socket.ts";

const trackerSocket = new TrackerServer({ http: false, udp: false, ws: { noServer: true }, stats: false });
export const infoSocket = new InfoServer({ ws: { noServer: true } });

export const runWebSocket = ({ server }: { server: Server }) => {
  server.on("upgrade", (request, socket, head) => {
    const { pathname } = parseURL(request.url);
    switch (pathname) {
      case "/tracker":
        trackerSocket.ws?.handleUpgrade(request, socket, head, (client) => {
          trackerSocket.ws?.emit("connection", client, request);
        });
        return;
      default:
        infoSocket.ws?.handleUpgrade(request, socket, head, (client) => {
          infoSocket.ws?.emit("connection", client, request);
        });
    }
  });
};
