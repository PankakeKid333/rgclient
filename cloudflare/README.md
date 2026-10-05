# rgchat Cloudflare backend

WebSocket + Durable Object backend for the RocketGoal chat.

## Architecture

- Cloudflare Worker handles HTTP requests.
- `GET /messages` loads the existing chat history from D1.
- `GET /ws` upgrades the connection to a WebSocket.
- One Durable Object named `main-room` holds the live connections.
- Messages are saved to the existing `rgchat2` D1 database.
- The newest 100 messages are retained.

## Deploy

From this folder:

```powershell
npm install
npx wrangler login
npx wrangler d1 execute rgchat2 --remote --file=./schema.sql
npm run deploy
```

Do not create a new D1 database. The Wrangler configuration points at the existing database.

## Endpoints

History:

`GET https://rgchat.billybob87343.workers.dev/messages`

WebSocket:

`wss://rgchat.billybob87343.workers.dev/ws`

## Client protocol

Send:

```js
socket.send(JSON.stringify({
  type: "send",
  name: username,
  text: message
}));
```

Receive:

```js
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "message") {
    // data.message = { id, name, text, timestamp }
  }

  if (data.type === "error") {
    console.error(data.error);
  }
};
```

Open the WebSocket once and keep it open for the chat session.

The server keeps the existing limits: names are limited to 20 characters, messages to 50 characters, empty messages are rejected, and only the newest 100 messages are retained.
