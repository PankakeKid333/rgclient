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

      if (request.method === "GET" && url.pathname === "/chat") {
        return new Response("<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>RocketGoal Chat</title>\n<style>\n*{box-sizing:border-box}\nhtml,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif;background:transparent;color:#fff}\n#chat{width:100%;height:100%;display:flex;flex-direction:column;background:rgba(18,18,22,.96);border:1px solid rgba(255,255,255,.18);border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.45)}\n#top{height:38px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:rgba(35,35,42,.98);font-size:14px;font-weight:700;flex:none}\n#status{font-size:11px;font-weight:400;opacity:.8}\n#messages{flex:1;overflow-y:auto;padding:8px 9px;scroll-behavior:smooth}\n.msg{padding:5px 4px;line-height:1.25;word-break:break-word}\n.name{font-weight:700;margin-right:5px;color:#7dc4ff}\n.time{font-size:9px;opacity:.45;margin-left:4px}\n#bottom{padding:7px;background:rgba(28,28,34,.98);border-top:1px solid rgba(255,255,255,.1)}\n#row{display:flex;gap:6px}\ninput{min-width:0;background:#111217;color:#fff;border:1px solid #444;border-radius:7px;padding:8px;font-size:13px;outline:none}\ninput:focus{border-color:#7dc4ff}\n#name{width:82px;flex:none}\n#text{flex:1}\nbutton{border:0;border-radius:7px;padding:0 13px;background:#3b82f6;color:white;font-weight:700;cursor:pointer}\nbutton:hover{background:#2563eb}\nbutton:disabled{opacity:.45;cursor:default}\n#error{font-size:11px;color:#ff8d8d;min-height:14px;padding:3px 2px 0}\n.empty{opacity:.55;text-align:center;padding:20px 5px;font-size:12px}\n</style>\n</head>\n<body>\n<div id=\"chat\">\n  <div id=\"top\"><span>RocketGoal Chat</span><span id=\"status\">Connecting...</span></div>\n  <div id=\"messages\"><div class=\"empty\">Loading chat...</div></div>\n  <div id=\"bottom\">\n    <div id=\"row\">\n      <input id=\"name\" maxlength=\"20\" placeholder=\"Name\">\n      <input id=\"text\" maxlength=\"50\" placeholder=\"Type a message...\" autocomplete=\"off\">\n      <button id=\"send\">Send</button>\n    </div>\n    <div id=\"error\"></div>\n  </div>\n</div>\n<script>\nconst API = location.origin;\nconst nameInput = document.getElementById(\"name\");\nconst textInput = document.getElementById(\"text\");\nconst sendButton = document.getElementById(\"send\");\nconst messagesEl = document.getElementById(\"messages\");\nconst statusEl = document.getElementById(\"status\");\nconst errorEl = document.getElementById(\"error\");\n\nlet socket = null;\nlet reconnectTimer = null;\nlet renderedIds = new Set();\n\nconst savedName = localStorage.getItem(\"rgChatUsername\");\nif (savedName) nameInput.value = savedName;\n\nfunction escapeHtml(value) {\n  return String(value).replace(/[&<>\"']/g, c => ({\n    \"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\",'\"':\"&quot;\",\"'\":\"&#39;\"\n  }[c]));\n}\n\nfunction addMessage(message) {\n  if (!message || !message.id || renderedIds.has(message.id)) return;\n  renderedIds.add(message.id);\n\n  const empty = messagesEl.querySelector(\".empty\");\n  if (empty) empty.remove();\n\n  const row = document.createElement(\"div\");\n  row.className = \"msg\";\n  const date = new Date(message.timestamp);\n  const time = Number.isNaN(date.getTime()) ? \"\" : date.toLocaleTimeString([], {hour:\"2-digit\",minute:\"2-digit\"});\n  row.innerHTML =\n    '<span class=\"name\">' + escapeHtml(message.name || \"Guest\") + '</span>' +\n    '<span>' + escapeHtml(message.text || \"\") + '</span>' +\n    (time ? '<span class=\"time\">' + escapeHtml(time) + '</span>' : \"\");\n  messagesEl.appendChild(row);\n\n  while (messagesEl.children.length > 100) messagesEl.firstElementChild.remove();\n  messagesEl.scrollTop = messagesEl.scrollHeight;\n}\n\nasync function loadHistory() {\n  try {\n    const response = await fetch(API + \"/messages\", {cache:\"no-store\"});\n    if (!response.ok) throw new Error(\"History request failed\");\n    const history = await response.json();\n    messagesEl.innerHTML = \"\";\n    renderedIds.clear();\n    for (const message of history) addMessage(message);\n    if (!messagesEl.children.length) messagesEl.innerHTML = '<div class=\"empty\">No messages yet.</div>';\n  } catch (e) {\n    messagesEl.innerHTML = '<div class=\"empty\">Could not load chat history.</div>';\n  }\n}\n\nfunction connect() {\n  clearTimeout(reconnectTimer);\n  statusEl.textContent = \"Connecting...\";\n  sendButton.disabled = true;\n\n  socket = new WebSocket(API.replace(/^http/, \"ws\") + \"/ws\");\n\n  socket.onopen = () => {\n    statusEl.textContent = \"Online\";\n    sendButton.disabled = false;\n    errorEl.textContent = \"\";\n  };\n\n  socket.onmessage = event => {\n    try {\n      const data = JSON.parse(event.data);\n      if (data.type === \"message\") addMessage(data.message);\n      if (data.type === \"error\") errorEl.textContent = data.error || \"Message error.\";\n    } catch {}\n  };\n\n  socket.onerror = () => {\n    statusEl.textContent = \"Connection error\";\n  };\n\n  socket.onclose = () => {\n    statusEl.textContent = \"Reconnecting...\";\n    sendButton.disabled = true;\n    reconnectTimer = setTimeout(connect, 1500);\n  };\n}\n\nfunction send() {\n  const name = nameInput.value.trim().slice(0,20) || \"Guest\";\n  const text = textInput.value.trim();\n  if (!text) return;\n\n  if (!socket || socket.readyState !== WebSocket.OPEN) {\n    errorEl.textContent = \"Not connected yet.\";\n    return;\n  }\n\n  localStorage.setItem(\"rgChatUsername\", name);\n  socket.send(JSON.stringify({type:\"send\", name, text}));\n  textInput.value = \"\";\n  textInput.focus();\n}\n\nsendButton.addEventListener(\"click\", send);\ntextInput.addEventListener(\"keydown\", e => {\n  if (e.key === \"Enter\" && !e.shiftKey) {\n    e.preventDefault();\n    send();\n  }\n});\nnameInput.addEventListener(\"change\", () => {\n  localStorage.setItem(\"rgChatUsername\", nameInput.value.trim().slice(0,20));\n});\n\nnameInput.addEventListener(\"paste\", () => {\n  setTimeout(() => {\n    nameInput.value = nameInput.value.slice(0,20);\n    localStorage.setItem(\"rgChatUsername\", nameInput.value.trim());\n  }, 0);\n});\n\nloadHistory();\nconnect();\ntextInput.focus();\nwindow.addEventListener("message", e => { if (e.source !== window.parent || e.data?.q !== "1") return; send(); });\n</script>\n</body>\n</html>", {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=UTF-8",
            "Cache-Control": "no-store",
            "Content-Security-Policy": "default-src 'self'; connect-src 'self' wss:; style-src 'unsafe-inline'; script-src 'unsafe-inline';"
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
