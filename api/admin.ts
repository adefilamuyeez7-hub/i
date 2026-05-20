import type { VercelRequest, VercelResponse } from "@vercel/node";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. Provide admin token." });
    }

    const token = authHeader.substring(7);
    if (token !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: "Forbidden. Invalid admin token." });
    }

    if (req.method === "GET") {
      const action = req.query.action;

      if (action === "stats") {
        return res.status(200).json({
          dashboard: {
            users: {
              total: 1,
              verified: 1,
              byTier: { "Tier 2 — Full": 1 },
              byRegion: { "Nigeria (NG)": 1 },
            },
            apiKeys: {
              totalKeys: 0,
              activeKeys: 0,
              neobankCount: 0,
              totalRequests: 0,
              topNeobanks: [],
            },
            blockchain: {
              totalNFTsMinted: 0,
              confirmedTransactions: 0,
              failedTransactions: 0,
              pendingTransactions: 0,
              chainId: 137,
              contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
              explorerUrl: "https://polygonscan.com/address/0x1234567890abcdef1234567890abcdef12345678",
            },
          },
        });
      }

      if (action === "keys") {
        return res.status(200).json({ keys: [] });
      }

      if (action === "blockchain") {
        return res.status(200).json({ records: [] });
      }

      if (action === "users") {
        return res.status(200).json({ users: [] });
      }

      return res.status(400).json({ error: "Unknown action" });
    }

    if (req.method === "POST") {
      const { action, neobank, name } = req.body;

      if (action === "generate-key") {
        if (!neobank || !name) {
          return res.status(400).json({ error: "Missing neobank or name" });
        }

        const key = `pk_${Math.random().toString(36).substr(2, 24)}`;
        const secret = `sk_${Math.random().toString(36).substr(2, 32)}`;

        return res.status(201).json({
          message: "API key generated successfully",
          neobank,
          key,
          secret,
          instructions: `Store this secret securely. You won't be able to see it again.`,
        });
      }

      return res.status(400).json({ error: "Unknown action" });
    }

    if (req.method === "DELETE") {
      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ error: "Missing API key to revoke" });
      }

      return res.status(200).json({
        message: "API key revoked successfully",
        key,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Admin API error:", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
}
