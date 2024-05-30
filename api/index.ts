import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { ethers } from "ethers";

const server = express();

server.use(express.json());
server.use(bodyParser.json({}));
server.use(cors());

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("> Error: Private Key >> 404 in env!");
  process.exit(1);
}

const wallet = new ethers.Wallet(privateKey);

server.get("/api", (_, res) => {
  res.send("GIFFORD Tech API Server is running!");
});

server.post("/api", async (req, res) => {
  try {
    const message = req.body.message;
    console.log({ message });

    if (!message) {
      return res.status(400).json({ error: "Message param is missing!" });
    }

    const signedMessage: string = await wallet.signMessage(message);
    res.json({ payload: signedMessage });
  } catch (error) {
    console.error("> Error: Sign Message >> ", error);
    res.status(500).json({ error });
  }
});

module.exports = (req: any, res: any) => {
  return server(req, res);
};
