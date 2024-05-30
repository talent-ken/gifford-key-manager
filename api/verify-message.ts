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

server.post("/api/verify-message", async (req, res) => {
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

module.exports = (req: any, res: any) => {
  return server(req, res);
};
