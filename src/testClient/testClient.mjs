// testClient.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
  socket.emit("joinDriver", "driver_123!");

socket.on("newRideRequest", (data) => {
  console.log("New ride request received:", data);
});

socket.emit("rider", ()=>{
  console.log("hello rider")
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
})
