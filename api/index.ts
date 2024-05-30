import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const server = express();

server.use(express.json());
server.use(bodyParser.json({}));
server.use(cors());

server.get("/api/", (_, res) => {
  res.send("GIFFORD Tech API Server is running!");
});

module.exports = (req: any, res: any) => {
  server(req, res);
};
