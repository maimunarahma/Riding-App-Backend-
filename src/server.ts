import express from "express";
import { Server } from "http";
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()
import app, { io } from "./app";

let server: Server;

const startServer = async () => {
  try {
  await mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n0bjr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
);

    console.log("connected to db");
    server = app.listen(5000, () => {
      console.log("hello from port ");
    });
     io.attach(server);

  } catch (error) {
    console.log(error);
  }
};
startServer()