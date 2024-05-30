"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const ethers_1 = require("ethers");
const cors_1 = __importDefault(require("cors"));
// Imports for SSL configuration
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server = (0, express_1.default)();
const PORT = process.env.PORT || 8800;
server.use(express_1.default.json());
server.use(body_parser_1.default.json());
server.use((0, cors_1.default)());
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    console.error("> Error: Private Key >> 404 in env!");
    process.exit(1);
}
const wallet = new ethers_1.ethers.Wallet(privateKey);
server.post("/sign-message", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = req.body.message;
        if (!message) {
            return res.status(400).json({ error: "Message param is missing!" });
        }
        const signedMessage = yield wallet.signMessage(message);
        res.json({ payload: signedMessage });
    }
    catch (error) {
        console.error("> Error: Sign Message >> ", error);
        res.status(500).json({ error });
    }
}));
server.post("/verify-message", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message, signedMessage, signerAddress } = req.body;
        if (!message || !signedMessage || !signerAddress) {
            return res
                .status(400)
                .json({ error: "Either one or more param(s) are missing!" });
        }
        const recoveredAddress = ethers_1.ethers.verifyMessage(message, signedMessage);
        const isValid = recoveredAddress.toLowerCase() ===
            signerAddress.toLowerCase();
        res.json({ payload: isValid });
    }
    catch (error) {
        console.error("> Error: Verify Message >> ", error);
        res.status(500).json({ error });
    }
}));
const sslOptions = {
    key: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../cert", "server.key")),
    cert: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../cert", "server.cert")),
};
https_1.default.createServer(sslOptions, server).listen(PORT, () => {
    console.info(`HTTPS server is running on: https://localhost:${PORT}`);
});
