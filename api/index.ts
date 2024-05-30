import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const server = express();

server.use(express.json());
server.use(bodyParser.json({}));
server.use(cors());

server.get("/api", (_, res) => {
  res.send("GIFFORD Tech API Server is running!");
});

server.post("/api/express", (_, res) => {
  res.status(200).json({ message: "Hello from Express!" });
});

module.exports = (req: any, res: any) => {
  return server(req, res);
};
