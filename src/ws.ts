import { type WebSocket, WebSocketServer } from "ws";
import type { Server } from "node:http";
import { liveInfo } from "./lib/ffmpeg.ts";

export const uuidMap = new Map<string, { lastSeen: number, url: WebSocket["url"] }>();

export const runWebSocket = ({ server }: { server: Server }) => {
  const wss = new WebSocketServer({ server });

  const deleteClient = (uuid: string) => {
    if (uuidMap.has(uuid)) uuidMap.delete(uuid);
  };

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      const payload: WebSocketMessage = JSON.parse(message?.toString() || "{}");
      if (!payload.type || !payload.uuid) return;
      const { type, uuid } = payload;
      const isConnected = uuid ? uuidMap.has(uuid) : false;

      if (type === "set" && uuid) {
        uuidMap.set(uuid, { lastSeen: Date.now(), url: ws.url });
        console.info(`[WS] Cliente conectado con UUID: ${uuid}`);
      }

      if (type === "delete" && uuid && isConnected) {
        deleteClient(uuid);
        console.info(`[WS] Cliente desconectado con UUID: ${uuid}`);
      }

      if (type === "heartbeat" && uuid && isConnected) {
        const client = uuidMap.get(uuid);
        if (client) client.lastSeen = Date.now();
      }
    });
  });

  // Enviar cada 10 segundos la cantidad de viewers
  setInterval(() => {
    const now = Date.now();
    for (const [uuid, client] of uuidMap.entries()) {
      if (now - client.lastSeen > 30000) {
        deleteClient(uuid);
      }
    }
    const viewersCount = uuidMap.size;
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: "liveInfo", ...liveInfo, viewerCount: viewersCount }));
      }
    }
  }, 10000);
};

interface WebSocketMessage {
  type: "set" | "delete" | "heartbeat";
  uuid: string;
}