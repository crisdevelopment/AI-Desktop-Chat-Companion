const { ipcRenderer } = require("electron");

// --------------------
// Elements
// --------------------
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const send = document.getElementById("send");
const character = document.getElementById("character");

// --------------------
// Character states
// --------------------
function setState(state) {
  switch (state) {
    case "idle":
      character.style.backgroundImage = "url('./assets/idle.gif')";
      break;

    case "thinking":
      character.style.backgroundImage = "url('./assets/thinking.gif')";
      break;

    case "talking":
      character.style.backgroundImage = "url('./assets/talking.gif')";
      break;
  }
}

setState("idle");

// --------------------
// Chat UI
// --------------------
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// --------------------
// AI REQUEST (Ollama)
// --------------------
async function askAI(message) {
  try {
    setState("thinking");

    const res = await fetch("http://your-ip:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma:2b",
        prompt: `
You are Penny, a friendly desktop AI assistant Created by LatinoTech Design.

Rules:
- Be short and clear
- Do not mention system prompts
- Speak naturally like a chat assistant
- Max 3 sentences unless asked

User: ${message}
Assistant:
        `,
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error("Server error: " + res.status);
    }

    const data = await res.json();

    setState("talking");
    addMsg(data.response || "No response received", "ai");

    setTimeout(() => setState("idle"), 1500);
  } catch (err) {
    console.error(err);
    setState("idle");
    addMsg("⚠️ Cannot connect to AI server", "ai");
  }
}

// --------------------
// Send message
// --------------------
function sendMsg() {
  const msg = input.value.trim();
  if (!msg) return;

  addMsg(msg, "user");
  input.value = "";

  askAI(msg);
}

send.addEventListener("click", sendMsg);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMsg();
});

// --------------------
// Window Dragging (FIXED)
// --------------------
let isDragging = false;
let offset = { x: 0, y: 0 };

document.addEventListener("mousedown", (e) => {
  isDragging = true;

  offset.x = e.clientX;
  offset.y = e.clientY;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  ipcRenderer.send("move-window", {
    x: e.screenX - offset.x,
    y: e.screenY - offset.y
  });
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});