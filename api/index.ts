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
    if (!Object.keys(message).length) {
      return res.status(400).json({ error: "Message param is missing!" });
    }

    console.log({ msgContent: message });

    const { contractAddr, walletAddr, amount, nonce, chainId } = message;
    const bigIntAmount = BigInt(amount as string);
    const packedMessage = ethers.solidityPacked(
      ["address", "uint256", "address", "uint256", "bytes32"],
      [contractAddr, chainId, walletAddr, bigIntAmount, nonce],
    );
    const signMessage = ethers.getBytes(
      ethers.solidityPackedKeccak256(["bytes"], [packedMessage]),
    );

    const signedMessage: string = await wallet.signMessage(signMessage);
    const { r, s, v } = ethers.Signature.from(signedMessage);
    res.json({ payload: { r, s, v } });
  } catch (error) {
    console.error("> Error: Sign Message >> ", error);
    res.status(500).json({ error });
  }
});

server.put("/api", async (req, res) => {
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
