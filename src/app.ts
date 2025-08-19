import cors from "cors";
import express, {
  type Response,
  type Request,
  type NextFunction,
} from "express";
import passport from "passport";
import { router } from "./routes";
import expressSession from "express-session";
import "./config/passport";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
const app = express();
const sessionSecret = process.env.EXPRESS_SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("EXPRESS_SESSION_SECRET environment variable is not set.");
}
app.use(
  expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());

const server = http.createServer(app);

app.use(cors());
app.use("/api/v1", router);
// app.use("/api/v1",router)
app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    message: " welcome to Tour Management System",
  });
});
// Store connected drivers: driverId -> socketId
export const driverSockets: Record<string, string> = {};
export const riderSockets: Record<string, string> = {};

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  const { riderId, driverId } = socket.handshake.query;
  console.log(`🚖 Driver connected: ${driverId}`);
  if (riderId) {
    riderSockets[riderId] = socket.id;
  }

  if (driverId) {
    driverSockets[driverId] = socket.id;
    console.log(`driver ${driverId} registered with socket id ${socket.id}`);
  }
  socket.on("ride-response", async (data) => {
    const { rideId, accepted } = data;
    console.log(
      `Driver ${driverId} responded to ride ${rideId}: ${
        accepted ? "Accepted" : "Rejected"
      }`
    );
  });
  socket.on("ride-response", async (data) => {
    const { rideId, accepted } = data;
    console.log(
      `Driver ${driverId} responded to ride ${rideId}: ${
        accepted ? "Accepted" : "Rejected"
      }`
    );
    try {
      const { Ride } = require("./modules/rider/rider.model");
      await Ride.findByIdAndUpdate(rideId, {
        status: accepted ? "accepted" : "rejected",
        driver: driverId,
      });

      // Optionally, notify rider (if you track rider sockets)
      // io.to(riderSocketId).emit("ride-status", { rideId, accepted });

      console.log(
        `✅ Ride ${rideId} updated to ${
          accepted ? "accepted" : "rejected"
        } by driver ${driverId}`
      );
    } catch (err) {
      console.error("Error updating ride status:", err);
    }
  });
  // ...existing code...
  socket.on("disconnect", () => {
    console.log(`❌ Driver disconnected: ${driverId}`);
    delete driverSockets[driverId];
  });
});

export default app;
