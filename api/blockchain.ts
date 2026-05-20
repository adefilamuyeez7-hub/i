import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DATA_DIR = "/tmp/proof-pass-db";
const BLOCKCHAIN_FILE = join(DATA_DIR, "blockchain-records.json");

interface BlockchainRecord {
  userId: string;
  txHash: string;
  contractAddress: string;
  nftTokenId: string;
  chainId: number;
  timestamp: string;
  blockNumber: number;
  status: "pending" | "confirmed" | "failed";
}

interface BlockchainData {
  records: BlockchainRecord[];
  contractAddress: string;
  deploymentBlock: number;
}

let inMemoryRecords: BlockchainRecord[] = [];

// Simulated blockchain configuration
const BLOCKCHAIN_CONFIG = {
  // Using Polygon (Matic) for this example
  chainId: 137,
  rpcUrl: "https://polygon-rpc.com/",
  contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
  deploymentBlock: 45000000,
};

// Initialize blockchain records
async function loadBlockchainRecords(): Promise<BlockchainRecord[]> {
  try {
    const data = await readFile(BLOCKCHAIN_FILE, "utf-8");
    return JSON.parse(data).records || inMemoryRecords;
  } catch {
    return inMemoryRecords;
  }
}

async function saveBlockchainRecords(records: BlockchainRecord[]) {
  inMemoryRecords = records;
  try {
    await writeFile(
      BLOCKCHAIN_FILE,
      JSON.stringify({ records, ...BLOCKCHAIN_CONFIG }, null, 2)
    );
  } catch (error) {
    console.warn("Could not save blockchain records, using memory only");
  }
}

// Simulate minting NFT on blockchain
export async function mintNFT(
  userId: string,
  userEmail: string,
  tier: string
): Promise<{ txHash: string; nftTokenId: string; blockNumber: number }> {
  // Simulate blockchain transaction
  const txHash = `0x${Array(64)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")}`;
  const nftTokenId = `TOKEN_${userId}_${Date.now()}`;
  const blockNumber = BLOCKCHAIN_CONFIG.deploymentBlock + Math.floor(Math.random() * 100000);

  const record: BlockchainRecord = {
    userId,
    txHash,
    contractAddress: BLOCKCHAIN_CONFIG.contractAddress,
    nftTokenId,
    chainId: BLOCKCHAIN_CONFIG.chainId,
    timestamp: new Date().toISOString(),
    blockNumber,
    status: "confirmed", // Simulated as confirmed immediately
  };

  const records = await loadBlockchainRecords();
  records.push(record);
  await saveBlockchainRecords(records);

  console.log(`✅ NFT Minted for ${userEmail}:`, {
    txHash,
    nftTokenId,
    tier,
  });

  return { txHash, nftTokenId, blockNumber };
}

// Verify NFT ownership
export async function verifyNFTOwnership(
  userEmail: string,
  walletAddress: string
): Promise<{
  isValid: boolean;
  nftTokenId?: string;
  txHash?: string;
  verifiedAt?: string;
}> {
  // Simulate blockchain verification
  const records = await loadBlockchainRecords();

  // In production, would call blockchain RPC to verify actual ownership
  // For now, simulate by checking if record exists
  const record = records.find((r) => r.userId === userEmail);

  if (record && record.status === "confirmed") {
    return {
      isValid: true,
      nftTokenId: record.nftTokenId,
      txHash: record.txHash,
      verifiedAt: record.timestamp,
    };
  }

  return { isValid: false };
}

// Get NFT metadata
export async function getNFTMetadata(
  nftTokenId: string
): Promise<{
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
  contractAddress: string;
  chainId: number;
  txHash: string;
} | null> {
  const records = await loadBlockchainRecords();
  const record = records.find((r) => r.nftTokenId === nftTokenId);

  if (!record) return null;

  return {
    name: `ProofPass Verification #${nftTokenId.split("_")[1]}`,
    description: `This NFT represents a verified identity on ProofPass. Holder has completed KYC verification and is eligible to participate in the ProofPass ecosystem.`,
    image: `ipfs://QmProofPassNFT/${nftTokenId}`,
    attributes: [
      { trait_type: "Verification Status", value: "Complete" },
      { trait_type: "Chain", value: "Polygon" },
      { trait_type: "Tier", value: "2 - Full" },
    ],
    contractAddress: BLOCKCHAIN_CONFIG.contractAddress,
    chainId: BLOCKCHAIN_CONFIG.chainId,
    txHash: record.txHash,
  };
}

// Get all blockchain records
export async function getAllBlockchainRecords(): Promise<BlockchainRecord[]> {
  return loadBlockchainRecords();
}

// Get blockchain stats
export async function getBlockchainStats() {
  const records = await loadBlockchainRecords();

  const stats = {
    totalNFTsMinted: records.length,
    confirmedTransactions: records.filter((r) => r.status === "confirmed")
      .length,
    failedTransactions: records.filter((r) => r.status === "failed").length,
    pendingTransactions: records.filter((r) => r.status === "pending").length,
    chainId: BLOCKCHAIN_CONFIG.chainId,
    contractAddress: BLOCKCHAIN_CONFIG.contractAddress,
    explorerUrl: `https://polygonscan.com/address/${BLOCKCHAIN_CONFIG.contractAddress}`,
  };

  return stats;
}

// Get blockchain explorer link
export function getExplorerLink(txHash: string): string {
  return `https://polygonscan.com/tx/${txHash}`;
}

// Export blockchain config
export function getBlockchainConfig() {
  return BLOCKCHAIN_CONFIG;
}
