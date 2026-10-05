// ==UserScript==
// @name         RocketGoal Chat
// @namespace    rocketgoal.io
// @version      1.0.0
// @description  Adds the RocketGoal WebSocket chat as a real, interactive iframe.
// @match        https://rocketgoal.io/*
// @match        https://www.rocketgoal.io/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";

  const CHAT_URL = "https://rgclient.billybob87343.workers.dev/chat";

  if (document.getElementById("rg-chat-iframe")) return;

  const frame = document.createElement("iframe");
  frame.id = "rg-chat-iframe";
  frame.src = CHAT_URL;
  frame.title = "RocketGoal Chat";
  frame.allow = "clipboard-read; clipboard-write";
  frame.setAttribute("loading", "eager");

  Object.assign(frame.style, {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    width: "360px",
    height: "460px",
    border: "0",
    borderRadius: "12px",
    zIndex: "2147483647",
    background: "transparent",
    pointerEvents: "auto",
    resize: "both",
    overflow: "hidden"
  });

  // The iframe is intentionally NOT sandboxed.
  // This keeps keyboard input, focus, and WebSockets working normally.
  document.documentElement.appendChild(frame);

  const toggle = document.createElement("button");
  toggle.id = "rg-chat-toggle";
  toggle.textContent = "Chat";
  Object.assign(toggle.style, {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    zIndex: "2147483646",
    display: "none",
    padding: "9px 14px",
    border: "0",
    borderRadius: "8px",
    background: "#3b82f6",
    color: "#fff",
    font: "700 13px Arial,sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,.35)"
  });

  document.documentElement.appendChild(toggle);

  const close = document.createElement("button");
  close.textContent = "×";
  close.title = "Hide chat";
  Object.assign(close.style, {
    position: "fixed",
    right: "27px",
    bottom: "447px",
    width: "25px",
    height: "25px",
    zIndex: "2147483648",
    border: "0",
    borderRadius: "50%",
    background: "rgba(0,0,0,.55)",
    color: "#fff",
    font: "20px/20px Arial,sans-serif",
    cursor: "pointer",
    padding: "0"
  });

  document.documentElement.appendChild(close);

  function showChat() {
    frame.style.display = "block";
    close.style.display = "block";
    toggle.style.display = "none";
  }

  function hideChat() {
    frame.style.display = "none";
    close.style.display = "none";
    toggle.style.display = "block";
  }

  close.addEventListener("click", hideChat);
  toggle.addEventListener("click", showChat);

  // Keep the close button aligned with the default frame.
  // It is only a convenience button; resizing the iframe does not affect chat input.
  window.addEventListener("resize", () => {
    if (frame.style.display !== "none") close.style.bottom = "447px";
  });
})();
