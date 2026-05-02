const { io } = require("socket.io-client");

const socket = io("wss://ws.oreidoaviator.com.br", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Conectado!");
});

socket.on("disconnect", () => {
  console.log("❌ Desconectado");
});

// Captura tudo que chega
socket.onAny((event, ...args) => {
  console.log("📡 Evento:", event);
  console.log("📦 Dados:", JSON.stringify(args, null, 2));
});