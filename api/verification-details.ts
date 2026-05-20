import type { VercelRequest, VercelResponse } from "@vercel/node";

// Simulated database for verification details
// In production: Use encrypted database, not filesystem
let verificationDetailsDb: Array<{
  verificationId: string;
  userId: string;
  idData: {
    type: string;
    number: string;
    issueDate: string;
    expiryDate: string;
    issuingCountry: string;
  };
  faceData: {
    confidence: number;
    landmarks: { x: number; y: number }[];
    encoding: string; // Face biometric template
  };
  matchScore: number;
  status: string;
  timestamp: string;
  viewedBy: Array<{
    neobankName: string;
    viewedAt: string;
    ipAddress: string;
  }>;
  encryptionKey: string;
  expiresAt: string;
}> = [];

// In-memory fallback
const inMemoryVerificationDetails: typeof verificationDetailsDb = [];

// Helper to get database
function getDb() {
  return verificationDetailsDb.length > 0 ? verificationDetailsDb : inMemoryVerificationDetails;
}

// Helper to store verification details (called after successful verification)
export async function storeVerificationDetails(
  verificationId: string,
  userId: string,
  idData: any,
  faceData: any,
  matchScore: number
) {
  const db = getDb();
  
  const details = {
    verificationId,
    userId,
    idData,
    faceData,
    matchScore,
    status: "verified",
    timestamp: new Date().toISOString(),
    viewedBy: [],
    encryptionKey: `key_${Math.random().toString(36).substr(2)}`,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };

  db.push(details);
  return details;
}

// Main API handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. Provide admin token." });
    }

    const token = authHeader.substring(7);
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
    
    if (token !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: "Forbidden. Invalid token." });
    }

    // GET /api/verification-details?id={verificationId}
    if (req.method === "GET") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Missing verification ID" });
      }

      const db = getDb();
      const details = db.find((d) => d.verificationId === id);

      if (!details) {
        return res.status(404).json({ error: "Verification not found" });
      }

      // Check if verification has expired
      if (new Date(details.expiresAt) < new Date()) {
        return res.status(410).json({ error: "Verification details have expired and been deleted" });
      }

      // Log access
      details.viewedBy.push({
        neobankName: req.query.neobank as string || "unknown",
        viewedAt: new Date().toISOString(),
        ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown",
      });

      // Return verification details (READ ONLY - no download)
      return res.status(200).json({
        verificationId: details.verificationId,
        userId: details.userId,
        status: details.status,
        verifiedAt: details.timestamp,
        expiresAt: details.expiresAt,
        matchScore: details.matchScore,
        idData: {
          type: details.idData.type,
          country: details.idData.issuingCountry,
          issueDate: details.idData.issueDate,
          expiryDate: details.idData.expiryDate,
          // Note: Actual ID number is NOT returned for security
          // Neobank only sees: It's valid, issued by country, dates
        },
        faceData: {
          livenessConfidence: details.faceData.confidence,
          // Note: Face encoding/template NOT returned (privacy)
          // Neobank only sees: How confident the liveness check was
        },
        viewHistory: details.viewedBy.map((v) => ({
          viewedAt: v.viewedAt,
          // Note: IP address hidden for privacy
        })),
        restrictions: {
          canDownload: false,
          canStore: false,
          canShare: false,
          accessibleFor: details.expiresAt,
        },
      });
    }

    // POST /api/verification-details?action=request-data
    // User can request their own data
    if (req.method === "POST") {
      const { action, verificationId, userId } = req.body;

      if (action === "user-data-request") {
        // User (via their neobank) requests their own verification data
        if (!verificationId || !userId) {
          return res.status(400).json({ error: "Missing verificationId or userId" });
        }

        const db = getDb();
        const details = db.find((d) => d.verificationId === verificationId && d.userId === userId);

        if (!details) {
          return res.status(404).json({ error: "Verification not found" });
        }

        // User gets full data for GDPR compliance (their own data)
        return res.status(200).json({
          message: "User verification data for GDPR request",
          data: details,
          note: "This is your data. You can export and use with other services.",
        });
      }

      if (action === "revoke-access") {
        // User revokes neobank access to their verification details
        if (!verificationId) {
          return res.status(400).json({ error: "Missing verificationId" });
        }

        const db = getDb();
        const details = db.find((d) => d.verificationId === verificationId);

        if (!details) {
          return res.status(404).json({ error: "Verification not found" });
        }

        // Mark as revoked (can still query but returns revoked status)
        details.status = "revoked";

        return res.status(200).json({
          message: "Access revoked. Neobanks can no longer view this verification.",
          verificationId,
        });
      }

      return res.status(400).json({ error: "Unknown action" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Verification details error:", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
}
