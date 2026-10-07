// ==UserScript==
// @name         RocketGoal Chat
// @namespace    rocketgoal.io
// @version      1.3.0
// @description  RocketGoal Chat
// @match        https://rocketgoal.io/*
// @match        https://www.rocketgoal.io/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  const CHAT_URL = "https://rgclient.billybob87343.workers.dev/chat";
  const FRAME_ID = "rg-chat-iframe";

  if (document.getElementById(FRAME_ID)) return;

  const frame = document.createElement("iframe");
  const dragBar = document.createElement("div");
  const closeButton = document.createElement("button");
  const showButton = document.createElement("button");
  const keyDisplay = document.createElement("div");

  frame.id = FRAME_ID;
  frame.src = CHAT_URL;
  frame.title = "RocketGoal Chat";
  frame.allow = "clipboard-read; clipboard-write";
  frame.loading = "eager";

  Object.assign(frame.style, {
    position: "fixed",
    left: "18px",
    top: "18px",
    width: "360px",
    height: "460px",
    border: "0",
    borderRadius: "12px",
    zIndex: "2147483647",
    background: "transparent",
    resize: "both",
    overflow: "hidden"
  });

  Object.assign(dragBar.style, {
    position: "fixed",
    left: "18px",
    top: "18px",
    width: "360px",
    height: "32px",
    zIndex: "2147483648",
    cursor: "move",
    background: "transparent",
    userSelect: "none"
  });

  Object.assign(closeButton.style, {
    position: "fixed",
    left: "369px",
    top: "27px",
    width: "25px",
    height: "25px",
    zIndex: "2147483649",
    border: "0",
    borderRadius: "50%",
    background: "rgba(0,0,0,.55)",
    color: "#fff",
    font: "20px/20px Arial,sans-serif",
    cursor: "pointer",
    padding: "0"
  });

  Object.assign(showButton.style, {
    position: "fixed",
    left: "18px",
    top: "18px",
    zIndex: "2147483648",
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

  Object.assign(keyDisplay.style, {
    position: "fixed",
    left: "18px",
    bottom: "18px",
    zIndex: "2147483646",
    display: "flex",
    gap: "5px",
    alignItems: "flex-end",
    pointerEvents: "none",
    userSelect: "none",
    font: "700 13px Arial,sans-serif"
  });

  closeButton.textContent = "×";
  closeButton.title = "Hide chat";
  showButton.textContent = "Chat";

  document.documentElement.append(frame, dragBar, closeButton, showButton, keyDisplay);

  let x = 18;
  let y = 18;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const pressed = new Map();
  const watchedKeys = new Map([
    ["w", "W"],
    ["a", "A"],
    ["s", "S"],
    ["d", "D"],
    [" ", "SPACE"],
    ["j", "J"],
    ["k", "K"],
    ["Shift", "SHIFT"]
  ]);

  function renderKeys() {
    keyDisplay.replaceChildren();

    for (const key of pressed.values()) {
      const box = document.createElement("span");

      Object.assign(box.style, {
        minWidth: key === "SPACE" ? "62px" : key === "SHIFT" ? "52px" : "30px",
        height: "30px",
        padding: "0 7px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        background: "rgba(20,20,24,.9)",
        border: "1px solid rgba(255,255,255,.28)",
        color: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,.35)"
      });

      box.textContent = key;
      keyDisplay.appendChild(box);
    }
  }

  function updatePosition() {
    frame.style.left = x + "px";
    frame.style.top = y + "px";
    frame.style.right = "auto";
    frame.style.bottom = "auto";

    dragBar.style.left = x + "px";
    dragBar.style.top = y + "px";
    dragBar.style.right = "auto";
    dragBar.style.bottom = "auto";

    closeButton.style.left = (x + frame.offsetWidth - 9) + "px";
    closeButton.style.top = (y + 9) + "px";
    closeButton.style.right = "auto";
    closeButton.style.bottom = "auto";
  }

  function showChat() {
    frame.style.display = "block";
    dragBar.style.display = "block";
    closeButton.style.display = "block";
    showButton.style.display = "none";
  }

  function hideChat() {
    frame.style.display = "none";
    dragBar.style.display = "none";
    closeButton.style.display = "none";
    showButton.style.display = "block";
  }

  dragBar.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;

    dragging = true;
    offsetX = event.clientX - x;
    offsetY = event.clientY - y;

    dragBar.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  dragBar.addEventListener("pointermove", event => {
    if (!dragging) return;

    x = Math.max(
      0,
      Math.min(innerWidth - frame.offsetWidth, event.clientX - offsetX)
    );

    y = Math.max(
      0,
      Math.min(innerHeight - frame.offsetHeight, event.clientY - offsetY)
    );

    updatePosition();
  });

  dragBar.addEventListener("pointerup", () => dragging = false);
  dragBar.addEventListener("pointercancel", () => dragging = false);

  closeButton.addEventListener("click", hideChat);
  showButton.addEventListener("click", showChat);

  window.addEventListener("resize", () => {
    if (frame.style.display !== "none") updatePosition();
  });

  window.addEventListener("keydown", event => {
    if (
      event.key === "1" &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      document.activeElement !== frame
    ) {
      frame.contentWindow?.postMessage({ q: "1" }, CHAT_URL);
    }

    const key = watchedKeys.get(event.key);
    if (!key || pressed.has(event.code)) return;

    pressed.set(event.code, key);
    renderKeys();
  });

  window.addEventListener("keyup", event => {
    if (!pressed.delete(event.code)) return;
    renderKeys();
  });

  window.addEventListener("blur", () => {
    pressed.clear();
    renderKeys();
  });
})();
