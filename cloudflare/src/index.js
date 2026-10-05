import { DurableObject } from "cloudflare:workers";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (request.method === "GET" && url.pathname === "/messages") {
        const result = await env.rgchat2
          .prepare(`
            SELECT id, name, text, timestamp
            FROM messages
            ORDER BY timestamp ASC
            LIMIT 100
          `)
          .all();

        return new Response(JSON.stringify(result.results), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }

      if (request.method === "GET" && url.pathname === "/ws") {
        if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
          return new Response("Expected WebSocket connection", { status: 426 });
        }

        const id = env.CHAT_ROOM.idFromName("main-room");
        const room = env.CHAT_ROOM.get(id);

        return room.fetch(request);
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error(error);

      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
  }
};

export class ChatRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;

    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong")
    );
  }

  async fetch(request) {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async webSocketMessage(ws, message) {
    try {
      if (typeof message !== "string") return;

      let body;
      try {
        body = JSON.parse(message);
      } catch {
        ws.send(JSON.stringify({
          type: "error",
          error: "Invalid JSON."
        }));
        return;
      }

      if (body?.type !== "send") return;

      const name =
        typeof body.name === "string"
          ? body.name.trim().slice(0, 20)
          : "Guest";

      const text =
        typeof body.text === "string"
          ? body.text.trim()
          : "";

      if (!text) {
        ws.send(JSON.stringify({
          type: "error",
          error: "Message is empty."
        }));
        return;
      }

      if ([...text].length > 50) {
        ws.send(JSON.stringify({
          type: "error",
          error: "Messages must be 50 characters or less."
        }));
        return;
      }

      const chatMessage = {
        id: crypto.randomUUID(),
        name: name || "Guest",
        text,
        timestamp: Date.now()
      };

      await this.env.rgchat2
        .prepare(`
          INSERT INTO messages (id, name, text, timestamp)
          VALUES (?, ?, ?, ?)
        `)
        .bind(
          chatMessage.id,
          chatMessage.name,
          chatMessage.text,
          chatMessage.timestamp
        )
        .run();

      await this.env.rgchat2
        .prepare(`
          DELETE FROM messages
          WHERE id NOT IN (
            SELECT id
            FROM messages
            ORDER BY timestamp DESC
            LIMIT 100
          )
        `)
        .run();

      const outgoing = JSON.stringify({
        type: "message",
        message: chatMessage
      });

      for (const socket of this.ctx.getWebSockets()) {
        try {
          socket.send(outgoing);
        } catch {
          // Ignore sockets that closed during broadcast.
        }
      }
    } catch (error) {
      console.error(error);

      try {
        ws.send(JSON.stringify({
          type: "error",
          error: error instanceof Error ? error.message : String(error)
        }));
      } catch {
        // Socket may already be closed.
      }
    }
  }

  async webSocketClose(ws, code, reason) {
    try {
      ws.close(code, reason);
    } catch {
      // Already closed.
    }
  }

  async webSocketError(ws) {
    try {
      ws.close();
    } catch {
      // Already closed.
    }
  }
}
