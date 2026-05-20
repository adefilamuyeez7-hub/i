import { readdir, writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

const DATA_DIR = "/tmp/proof-pass-db";
const KEYS_FILE = join(DATA_DIR, "api-keys.json");

interface ApiKey {
  key: string;
  name: string;
  neobank: string;
  createdAt: string;
  lastUsed?: string;
  requestCount: number;
  isActive: boolean;
}

interface KeysData {
  keys: ApiKey[];
}

let inMemoryKeys: ApiKey[] = [];

// Initialize data directory
async function initializeDir() {
  try {
    await readdir(DATA_DIR);
  } catch {
    // Directory doesn't exist, create it
  }
}

// Load keys from file or return in-memory fallback
async function loadKeys(): Promise<ApiKey[]> {
  try {
    const data = await readFile(KEYS_FILE, "utf-8");
    return JSON.parse(data).keys || inMemoryKeys;
  } catch {
    return inMemoryKeys;
  }
}

// Save keys to file and memory
async function saveKeys(keys: ApiKey[]) {
  inMemoryKeys = keys;
  try {
    await initializeDir();
    await writeFile(KEYS_FILE, JSON.stringify({ keys }, null, 2));
  } catch (error) {
    console.warn("Could not save API keys to file, using memory only");
  }
}

// Generate new API key
export async function generateApiKey(
  neobank: string,
  name: string
): Promise<{ key: string; secret: string }> {
  const keys = await loadKeys();

  // Generate key (public) and secret
  const publicKey = `pk_${crypto.randomBytes(16).toString("hex")}`;
  const secret = crypto.randomBytes(32).toString("hex");
  
  // Store hashed secret
  const hashedSecret = crypto
    .createHash("sha256")
    .update(secret)
    .digest("hex");

  const newKey: ApiKey = {
    key: publicKey,
    name,
    neobank,
    createdAt: new Date().toISOString(),
    requestCount: 0,
    isActive: true,
  };

  keys.push(newKey);
  await saveKeys(keys);

  return { key: publicKey, secret: hashedSecret };
}

// Validate API key
export async function validateApiKey(
  publicKey: string,
  hashedSecret: string
): Promise<ApiKey | null> {
  const keys = await loadKeys();
  const key = keys.find((k) => k.key === publicKey && k.isActive);

  if (!key) return null;

  // Update last used
  key.lastUsed = new Date().toISOString();
  key.requestCount++;
  await saveKeys(keys);

  return key;
}

// Get all API keys for a neobank
export async function getNeobankKeys(neobank: string): Promise<ApiKey[]> {
  const keys = await loadKeys();
  return keys.filter((k) => k.neobank === neobank);
}

// Revoke API key
export async function revokeApiKey(publicKey: string): Promise<boolean> {
  const keys = await loadKeys();
  const key = keys.find((k) => k.key === publicKey);

  if (key) {
    key.isActive = false;
    await saveKeys(keys);
    return true;
  }

  return false;
}

// Get all API keys (admin only)
export async function getAllApiKeys(): Promise<ApiKey[]> {
  return loadKeys();
}

// Get API key stats
export async function getApiKeyStats() {
  const keys = await loadKeys();

  const stats = {
    totalKeys: keys.length,
    activeKeys: keys.filter((k) => k.isActive).length,
    neobankCount: new Set(keys.map((k) => k.neobank)).size,
    totalRequests: keys.reduce((sum, k) => sum + k.requestCount, 0),
    topNeobanks: Object.entries(
      keys.reduce(
        (acc, k) => {
          acc[k.neobank] = (acc[k.neobank] || 0) + k.requestCount;
          return acc;
        },
        {} as Record<string, number>
      )
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
  };

  return stats;
}
