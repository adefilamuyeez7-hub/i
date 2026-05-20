import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  generateApiKey,
  getNeobankKeys,
  revokeApiKey,
  getAllApiKeys,
  getApiKeyStats,
} from "./keys";
import { getAllBlockchainRecords, getBlockchainStats } from "./blockchain";
import { getUsers } from "./db";

// Simple admin password for demo (use proper auth in production)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(200).json({ ok: true });
    return;
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. Provide admin token." });
    }

    const token = authHeader.substring(7);
    if (token !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: "Forbidden. Invalid admin token." });
    }

    // GET /api/admin - Get dashboard stats
    if (req.method === "GET") {
      if (req.query.action === "stats") {
        try {
          const users = await getUsers();
          const keyStats = await getApiKeyStats();
          const blockchainStats = await getBlockchainStats();

          return res.status(200).json({
            dashboard: {
              users: {
                total: Array.isArray(users) ? users.length : 0,
                verified: Array.isArray(users) ? users.filter((u: any) => u.status === "Complete").length : 0,
                byTier: Array.isArray(users) ? users.reduce(
                  (acc: any, u: any) => {
                    acc[u.tier || "Unknown"] = (acc[u.tier || "Unknown"] || 0) + 1;
                    return acc;
                  },
                  {}
                ) : {},
                byRegion: Array.isArray(users) ? users.reduce(
                  (acc: any, u: any) => {
                    acc[u.region || "Unknown"] = (acc[u.region || "Unknown"] || 0) + 1;
                    return acc;
                  },
                  {}
                ) : {},
              },
              apiKeys: keyStats || { totalKeys: 0, activeKeys: 0, neobankCount: 0, totalRequests: 0, topNeobanks: [] },
              blockchain: blockchainStats || { totalNFTsMinted: 0, confirmedTransactions: 0, failedTransactions: 0, pendingTransactions: 0, chainId: 137, contractAddress: "0x1234567890abcdef1234567890abcdef12345678" },
            },
          });
        } catch (error: any) {
          console.error("Stats error:", error);
          // Return default stats even if there's an error
          return res.status(200).json({
            dashboard: {
              users: { total: 0, verified: 0, byTier: {}, byRegion: {} },
              apiKeys: { totalKeys: 0, activeKeys: 0, neobankCount: 0, totalRequests: 0, topNeobanks: [] },
              blockchain: { totalNFTsMinted: 0, confirmedTransactions: 0, failedTransactions: 0, pendingTransactions: 0, chainId: 137, contractAddress: "0x1234567890abcdef1234567890abcdef12345678", explorerUrl: "https://polygonscan.com/address/0x1234567890abcdef1234567890abcdef12345678" },
            },
          });
        }
      }

      if (req.query.action === "keys") {
        try {
          const keys = await getAllApiKeys();
          const safeKeys = keys.map((k) => ({
            key: k.key,
            name: k.name,
            neobank: k.neobank,
            createdAt: k.createdAt,
            lastUsed: k.lastUsed,
            requestCount: k.requestCount,
            isActive: k.isActive,
          }));
          return res.status(200).json({ keys: safeKeys });
        } catch (error) {
          return res.status(200).json({ keys: [] });
        }
      }

      if (req.query.action === "blockchain") {
        try {
          const records = await getAllBlockchainRecords();
          return res.status(200).json({ records: records || [] });
        } catch (error) {
          return res.status(200).json({ records: [] });
        }
      }

      if (req.query.action === "users") {
        try {
          const users = await getUsers();
          return res.status(200).json({ users: users || [] });
        } catch (error) {
          return res.status(200).json({ users: [] });
        }
      }

      return res.status(200).json({ error: "Unknown action" });
    }

    // POST /api/admin - Create API key or manage resources
    if (req.method === "POST") {
      const { action, neobank, name } = req.body;

      if (action === "generate-key") {
        if (!neobank || !name) {
          return res
            .status(400)
            .json({ error: "Missing neobank or name" });
        }

        const { key, secret } = await generateApiKey(neobank, name);

        return res.status(201).json({
          message: "API key generated successfully",
          neobank,
          key,
          secret,
          instructions: `Store this secret securely. You won't be able to see it again. Use key and secret together for API authentication.`,
        });
      }

      return res.status(400).json({ error: "Unknown action" });
    }

    // DELETE /api/admin - Revoke API key
    if (req.method === "DELETE") {
      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ error: "Missing API key to revoke" });
      }

      const revoked = await revokeApiKey(key);

      if (revoked) {
        return res.status(200).json({
          message: "API key revoked successfully",
          key,
        });
      }

      return res.status(404).json({ error: "API key not found" });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Admin API error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
}
