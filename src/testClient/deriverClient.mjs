import { io } from "socket.io-client";

// Grab driverId dynamically from command line
const DRIVER_ID = process.argv[2];  

if (!DRIVER_ID) {
  console.error("❌ Please provide a driverId, e.g. node driver-client.js driver123");
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  query: { driverId: DRIVER_ID },
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log(`✅ Driver ${DRIVER_ID} connected with socket ID: ${socket.id}`);
});

socket.on("ride-request", (data) => {
  console.log(`📢 Driver ${DRIVER_ID} received ride request:`, data);
  socket.emit("ride-response", { rideId: data.rideId, accepted: true });
});
socket.on("ride-response", (data) => {
  console.log(`📢 Driver ${DRIVER_ID} received ride request and update its status:`, data);
  socket.emit("ride-response", { rideId: data.rideId, accepted: true });
});