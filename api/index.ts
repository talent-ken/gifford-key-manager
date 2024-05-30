import express from "express";
import bodyParser from "body-parser";
import { ethers } from "ethers";
import cors from "cors";
// Imports for SSL configuration
import fs from "fs";
import https from "https";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const server = express();
const PORT = process.env.PORT || 8800;

server.use(express.json());
server.use(bodyParser.json());
server.use(cors());

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("> Error: Private Key >> 404 in env!");
  process.exit(1);
}

const wallet = new ethers.Wallet(privateKey);

server.get("/", (_, res) => {
  res.send("GIFFORD Tech API Server is running!");
});

server.post("/sign-message", async (req, res) => {
  try {
    const message = req.body.message;
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

server.post("/verify-message", async (req, res) => {
  try {
    const { message, signedMessage, signerAddress } = req.body;
    if (!message || !signedMessage || !signerAddress) {
      return res
        .status(400)
        .json({ error: "Either one or more param(s) are missing!" });
    }

    const recoveredAddress = ethers.verifyMessage(message, signedMessage);
    const isValid =
      recoveredAddress.toLowerCase() ===
      (signerAddress as string).toLowerCase();

    res.json({ payload: isValid });
  } catch (error) {
    console.error("> Error: Verify Message >> ", error);
    res.status(500).json({ error });
  }
});

const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, "../cert", "server.key")),
  cert: fs.readFileSync(path.resolve(__dirname, "../cert", "server.cert")),
};

https.createServer(sslOptions, server).listen(PORT, () => {
  console.info(`HTTPS server is running on: https://localhost:${PORT}`);
});
