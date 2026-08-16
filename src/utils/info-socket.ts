import { type ServerOptions, WebSocketServer } from "ws";
import { liveInfo } from "../lib/ffmpeg.ts";

export class Server {
  public ws: WebSocketServer | null;
  private viewers = new Map<string, Viewer>();

  constructor (options: { ws?: ServerOptions } = {}) {
    this.ws = options.ws ? new WebSocketServer(options.ws) : null;

    this.ws?.on("connection", (ws) => {
      ws.on("message", (message) => {
        const payload: WebSocketMessage = JSON.parse(message?.toString() || "{}");
        if (!payload.type || !payload.uuid) return;

        const { type, uuid } = payload;
        const isConnected = this.viewers.has(uuid);

        if (type === "set") {
          this.viewers.set(uuid, { lastSeen: Date.now(), url: ws.url });
          console.info(`[WS] Cliente conectado con UUID: ${uuid}`);
        }

        if (type === "delete" && isConnected) {
          this.deleteClient(uuid);
          console.info(`[WS] Cliente desconectado con UUID: ${uuid}`);
        }

        if (type === "heartbeat" && isConnected) {
          const client = this.viewers.get(uuid);
          if (client) client.lastSeen = Date.now();
        }
      });
    });

    // Enviar cada 10 segundos la cantidad de viewers
    setInterval(() => {
      const now = Date.now();
      for (const [uuid, client] of this.viewers.entries()) {
        if (now - client.lastSeen > 30000) {
          this.deleteClient(uuid);
        }
      }

      const viewersCount = this.viewerCount;
      for (const client of this.ws?.clients || []) {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: "liveInfo", ...liveInfo, viewerCount: viewersCount }));
        }
      }
    }, 10000);
  }

  public get viewerCount () {
    return this.viewers.size;
  }

  private deleteClient (uuid: string) {
    if (this.viewers.has(uuid)) this.viewers.delete(uuid);
  }
}

interface WebSocketMessage {
  type: "set" | "delete" | "heartbeat";
  uuid: string;
}

interface Viewer {
  lastSeen: number;
  url: WebSocket["url"];
}