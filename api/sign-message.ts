import express from "express";
import bodyParser from "body-parser";
import { ethers } from "ethers";
import cors from "cors";

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

server.post("/api/sign-message", async (req, res) => {
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

module.exports = (req: any, res: any) => {
  server(req, res);
};
