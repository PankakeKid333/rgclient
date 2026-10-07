// ==UserScript==
// @name         RocketGoal Chat
// @namespace    rocketgoal.io
// @version      1.4.0
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


  const filterHud = document.createElement("div");
  const filterTitle = document.createElement("div");
  const filterControls = document.createElement("div");
  const filterPresets = document.createElement("div");
  const filterDrag = document.createElement("div");

  Object.assign(filterHud.style, {
    position: "fixed",
    left: "400px",
    top: "18px",
    width: "260px",
    padding: "10px",
    zIndex: "2147483647",
    background: "rgba(15,15,20,.94)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,.2)",
    borderRadius: "10px",
    boxShadow: "0 6px 25px rgba(0,0,0,.4)",
    font: "12px Arial,sans-serif",
    userSelect: "none"
  });

  Object.assign(filterDrag.style, {
    height: "22px",
    cursor: "move"
  });

  filterTitle.textContent = "Screen Filter";
  Object.assign(filterTitle.style, {
    font: "700 14px Arial,sans-serif",
    marginBottom: "7px"
  });

  filterDrag.appendChild(filterTitle);
  filterHud.appendChild(filterDrag);
  filterHud.appendChild(filterControls);
  filterHud.appendChild(filterPresets);
  document.documentElement.appendChild(filterHud);

  const filterValues = {
    hue: 0,
    saturation: 100,
    brightness: 100,
    contrast: 100,
    invert: 0,
    rotate: 0
  };

  function applyScreenFilter() {
    if (!document.body) return;

    document.body.style.filter =
      "hue-rotate(" + filterValues.hue + "deg) " +
      "saturate(" + filterValues.saturation + "%) " +
      "brightness(" + filterValues.brightness + "%) " +
      "contrast(" + filterValues.contrast + "%) " +
      "invert(" + filterValues.invert + "%) " +
      "rotate(" + filterValues.rotate + "deg)";
  }

  function addSlider(label, key, min, max, step) {
    const row = document.createElement("div");
    const text = document.createElement("div");
    const slider = document.createElement("input");

    text.textContent = label + ": " + filterValues[key];
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = filterValues[key];

    Object.assign(row.style, { marginBottom: "7px" });
    Object.assign(slider.style, { width: "100%" });

    slider.addEventListener("input", () => {
      filterValues[key] = Number(slider.value);
      text.textContent = label + ": " + filterValues[key];
      applyScreenFilter();
    });

    row.append(text, slider);
    filterControls.appendChild(row);
  }

  addSlider("Hue", "hue", 0, 360, 1);
  addSlider("Saturation", "saturation", 0, 300, 1);
  addSlider("Brightness", "brightness", 0, 200, 1);
  addSlider("Contrast", "contrast", 0, 300, 1);
  addSlider("Invert", "invert", 0, 100, 1);
  addSlider("Rotate", "rotate", -180, 180, 1);

  const presets = {
    Normal: { hue: 0, saturation: 100, brightness: 100, contrast: 100, invert: 0, rotate: 0 },
    "Night Vision": { hue: 95, saturation: 160, brightness: 85, contrast: 125, invert: 0, rotate: 0 },
    "Purple": { hue: 275, saturation: 190, brightness: 105, contrast: 110, invert: 0, rotate: 0 },
    "Red": { hue: 350, saturation: 210, brightness: 105, contrast: 115, invert: 0, rotate: 0 },
    "Inverted": { hue: 0, saturation: 100, brightness: 100, contrast: 100, invert: 100, rotate: 0 },
    "Upside Down": { hue: 0, saturation: 100, brightness: 100, contrast: 100, invert: 0, rotate: 180 }
  };

  const presetTitle = document.createElement("div");
  presetTitle.textContent = "Presets";
  Object.assign(presetTitle.style, {
    fontWeight: "700",
    margin: "3px 0 5px"
  });
  filterPresets.appendChild(presetTitle);

  const presetGrid = document.createElement("div");
  Object.assign(presetGrid.style, {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "5px"
  });
  filterPresets.appendChild(presetGrid);

  for (const [name, values] of Object.entries(presets)) {
    const button = document.createElement("button");
    button.textContent = name;
    Object.assign(button.style, {
      padding: "5px",
      border: "1px solid rgba(255,255,255,.2)",
      borderRadius: "6px",
      background: "#25252c",
      color: "#fff",
      cursor: "pointer",
      font: "11px Arial,sans-serif"
    });

    button.addEventListener("click", () => {
      Object.assign(filterValues, values);
      filterControls.querySelectorAll("input").forEach((slider, index) => {
        const keys = ["hue", "saturation", "brightness", "contrast", "invert", "rotate"];
        slider.value = filterValues[keys[index]];
        slider.dispatchEvent(new Event("input"));
      });
    });

    presetGrid.appendChild(button);
  }

  let filterX = 400;
  let filterY = 18;
  let filterDragging = false;
  let filterOffsetX = 0;
  let filterOffsetY = 0;

  filterDrag.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    filterDragging = true;
    filterOffsetX = event.clientX - filterX;
    filterOffsetY = event.clientY - filterY;
    filterDrag.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  filterDrag.addEventListener("pointermove", event => {
    if (!filterDragging) return;

    filterX = Math.max(0, Math.min(innerWidth - filterHud.offsetWidth, event.clientX - filterOffsetX));
    filterY = Math.max(0, Math.min(innerHeight - filterHud.offsetHeight, event.clientY - filterOffsetY));

    filterHud.style.left = filterX + "px";
    filterHud.style.top = filterY + "px";
  });

  filterDrag.addEventListener("pointerup", () => filterDragging = false);
  filterDrag.addEventListener("pointercancel", () => filterDragging = false);

  applyScreenFilter();

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
