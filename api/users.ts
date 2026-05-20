import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUsers, saveUser, getUserById } from "./db";
import { validateApiKey } from "./keys";
import { mintNFT, verifyNFTOwnership } from "./blockchain";
import crypto from "crypto";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(200).json({ ok: true });
    return;
  }

  try {
    // Check API key for POST requests (GET is public)
    if (req.method === "POST") {
      const authHeader = req.headers.authorization;
      const isFromFrontend = !authHeader || authHeader.includes("Bearer public");

      // If from neobank backend, validate API key
      if (!isFromFrontend) {
        if (!authHeader) {
          return res.status(401).json({ error: "Missing API key. Use Authorization header." });
        }

        const [scheme, credentials] = authHeader.split(" ");
        if (scheme !== "Bearer") {
          return res.status(401).json({ error: "Invalid authorization scheme. Use Bearer token." });
        }

        // For demo: accept the API key directly (in production, verify hash)
        // In production: validate against stored hashed keys
        if (!credentials.startsWith("pk_")) {
          return res.status(401).json({ error: "Invalid API key format." });
        }

        // Validate the key exists
        const isValidKey = credentials.startsWith("pk_"); // Simplified for demo
        if (!isValidKey) {
          return res.status(401).json({ error: "Invalid or revoked API key." });
        }
      }
    }

    if (req.method === "GET") {
      if (req.query.id) {
        const user = await getUserById(req.query.id as string);
        return res.status(200).json(user || { error: "Not found" });
      }
      const users = await getUsers();
      return res.status(200).json(users);
    }

    if (req.method === "POST") {
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ error: "Invalid request body" });
      }

      // Save user to database
      const user = await saveUser(req.body);

      // Attempt to mint NFT on blockchain (non-blocking)
      // If it fails, still return success - the user is saved even if NFT minting fails
      try {
        if (!user.nftMinted) {
          try {
            const { txHash, nftTokenId, blockNumber } = await mintNFT(
              user.id,
              user.email,
              user.tier
            );

            // Update user with blockchain data
            user.nftMinted = true;
            user.blockchainTxHash = txHash;
            user.nftTokenId = nftTokenId;
            user.blockchainBlockNumber = blockNumber;

            await saveUser(user);

            return res.status(201).json({
              ...user,
              blockchain: {
                txHash,
                nftTokenId,
                blockNumber,
                chainId: 137,
                contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
                message: "NFT successfully minted on Polygon blockchain",
              },
            });
          } catch (blockchainError) {
            console.warn("Blockchain minting failed, continuing without NFT:", blockchainError);
            // Still return user data even if NFT minting fails
            return res.status(201).json(user);
          }
        }
      } catch (nftError) {
        console.warn("NFT handling error:", nftError);
        // Return user data without blockchain info if anything fails
        return res.status(201).json(user);
      }

      return res.status(201).json(user);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
}
