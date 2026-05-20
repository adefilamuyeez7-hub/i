# ProofPass Advanced Features

## 🔐 Feature 1: API Key Authentication

### Overview
ProofPass now supports API key authentication for neobank partners integrating through backend APIs.

### How It Works

```
Frontend (No API Key Required)
    ├─ Direct calls to /api/users (GET/POST)
    └─ Public access for user onboarding

Backend (API Key Required)
    ├─ Must include Authorization header
    ├─ Format: Authorization: Bearer {API_KEY}
    └─ Used for neobank partner integrations
```

### Getting Started

**Step 1: Generate API Key (Admin Only)**

```bash
curl -X POST https://proof-pass-verified-main.vercel.app/api/admin \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate-key",
    "neobank": "Flutterwave",
    "name": "Production Key"
  }'
```

Response:
```json
{
  "message": "API key generated successfully",
  "neobank": "Flutterwave",
  "key": "pk_abc123def456...",
  "secret": "sk_xyz789uvw012...",
  "instructions": "Store this secret securely..."
}
```

**Step 2: Use API Key in Neobank Backend**

```javascript
// Node.js example
const PROOFPASS_API = "https://proof-pass-verified-main.vercel.app/api";
const API_KEY = "pk_abc123def456...";

// Save user after KYC
async function registerUserWithProofPass(userData) {
  const response = await fetch(`${PROOFPASS_API}/users`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });
  
  return response.json();
}

// Check if user already verified
async function checkProofPassStatus(userId) {
  const response = await fetch(
    `${PROOFPASS_API}/users?id=${userId}`,
    {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      }
    }
  );
  
  return response.json();
}
```

### API Key Security Best Practices

✅ **Do:**
- Store API keys in environment variables
- Rotate keys regularly
- Use different keys for different environments (dev/staging/prod)
- Monitor key usage via admin dashboard
- Revoke unused keys immediately

❌ **Don't:**
- Commit API keys to version control
- Hardcode keys in frontend code
- Share keys across teams
- Use same key for multiple services

### Managing API Keys

**View all active keys:**
```bash
curl https://proof-pass-verified-main.vercel.app/api/admin?action=keys \
  -H "Authorization: Bearer admin123"
```

**Revoke an API key:**
```bash
curl -X DELETE https://proof-pass-verified-main.vercel.app/api/admin \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{"key": "pk_abc123..."}'
```

---

## 🔗 Feature 2: Blockchain Verification & NFT Minting

### Overview
When a user completes verification, their identity is minted as an NFT on the Polygon blockchain. This NFT serves as a portable, verifiable credential.

### How It Works

```
User Completes KYC
    ↓
POST /api/users (Save to database)
    ↓
Automatically Mint NFT
    ├─ Generate unique NFT token ID
    ├─ Create blockchain transaction
    ├─ Deploy on Polygon (chainId: 137)
    └─ Return transaction hash
    ↓
User receives blockchain verification
    ├─ Can verify ownership with any wallet
    ├─ NFT transferable to cold storage
    └─ Portable across dApps
```

### NFT Details

**Blockchain:**
- Network: Polygon (Matic)
- Chain ID: 137
- Contract Address: `0x1234567890abcdef1234567890abcdef12345678`
- Standard: ERC-721 (NFT)

**NFT Metadata:**
```json
{
  "name": "ProofPass Verification #user_1716234567890",
  "description": "This NFT represents a verified identity on ProofPass",
  "image": "ipfs://QmProofPassNFT/...",
  "attributes": [
    {
      "trait_type": "Verification Status",
      "value": "Complete"
    },
    {
      "trait_type": "Chain",
      "value": "Polygon"
    },
    {
      "trait_type": "KYC Tier",
      "value": "Tier 2 - Full"
    }
  ]
}
```

### API Response with Blockchain Data

When a user registers, the response includes blockchain information:

```json
{
  "id": "user_123",
  "email": "john@example.com",
  "status": "Complete",
  "tier": "Tier 2 — Full",
  "region": "Nigeria (NG)",
  "nftMinted": true,
  "blockchainTxHash": "0x7a3b...",
  "nftTokenId": "TOKEN_user_123_1716234567890",
  "blockchainBlockNumber": 45123456,
  "blockchain": {
    "txHash": "0x7a3b...",
    "nftTokenId": "TOKEN_user_123_1716234567890",
    "blockNumber": 45123456,
    "chainId": 137,
    "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "message": "NFT successfully minted on Polygon blockchain"
  }
}
```

### Verifying NFT Ownership

**Check if user owns their NFT:**

```bash
curl "https://proof-pass-verified-main.vercel.app/api/blockchain/verify?email=john@example.com"
```

Response:
```json
{
  "isValid": true,
  "nftTokenId": "TOKEN_user_123_1716234567890",
  "txHash": "0x7a3b...",
  "verifiedAt": "2026-05-20T14:25:07Z"
}
```

### Getting NFT Metadata

```bash
curl "https://proof-pass-verified-main.vercel.app/api/blockchain/metadata?tokenId=TOKEN_user_123_1716234567890"
```

Response:
```json
{
  "name": "ProofPass Verification #TOKEN_user_123_1716234567890",
  "description": "This NFT represents a verified identity on ProofPass",
  "image": "ipfs://QmProofPassNFT/...",
  "attributes": [...],
  "contractAddress": "0x1234567890abcdef...",
  "chainId": 137,
  "txHash": "0x7a3b..."
}
```

### View on Blockchain Explorer

Users can view their NFT on Polygonscan:

```
https://polygonscan.com/tx/{txHash}
```

### Implementation Notes

- NFT minting is automatic and transparent to the user
- Transaction fees are subsidized (usually covered by ProofPass)
- Blockchain data is immutable and cannot be revoked
- NFTs can be viewed in any Web3 wallet (MetaMask, Trust Wallet, etc.)
- Future versions will support multiple blockchains (Ethereum, Arbitrum, etc.)

---

## 📊 Feature 3: Admin Dashboard

### Access Admin Dashboard

```
https://proof-pass-verified-main.vercel.app/admin
```

**Login Credentials:**
- Admin Token: `admin123` (use Bearer token)

### Dashboard Features

#### Overview Tab
- **Total Users:** Verified and unverified count
- **Users by Tier:** Breakdown of Tier 1, Tier 2, etc.
- **Users by Region:** Geographic distribution
- **API Activity:** Top neobank partners by request volume

#### API Keys Tab
- Generate new API keys for neobank partners
- View all active API keys
- See request volume per neobank
- Revoke API keys if needed
- Track key creation dates and last usage

#### Blockchain Tab
- Network status (Polygon mainnet)
- NFT minting statistics
  - Total NFTs minted
  - Confirmed transactions
  - Failed transactions
  - Pending transactions
- View contract address
- Link to Polygonscan for on-chain verification

#### Users Tab
- List all verified users
- View user details (email, tier, region)
- Check verification timestamps
- Monitor expiry dates

### Admin API Endpoints

**Get Dashboard Stats:**
```bash
curl https://proof-pass-verified-main.vercel.app/api/admin?action=stats \
  -H "Authorization: Bearer admin123"
```

**Get All API Keys:**
```bash
curl https://proof-pass-verified-main.vercel.app/api/admin?action=keys \
  -H "Authorization: Bearer admin123"
```

**Get Blockchain Records:**
```bash
curl https://proof-pass-verified-main.vercel.app/api/admin?action=blockchain \
  -H "Authorization: Bearer admin123"
```

**Generate New API Key:**
```bash
curl -X POST https://proof-pass-verified-main.vercel.app/api/admin \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate-key",
    "neobank": "Opay",
    "name": "Production"
  }'
```

**Revoke API Key:**
```bash
curl -X DELETE https://proof-pass-verified-main.vercel.app/api/admin \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{"key": "pk_abc123..."}'
```

---

## 🔄 Complete Integration Flow with All Features

```
┌─────────────────────────────────────────────────────────────────┐
│                NEOBANK INTEGRATION WORKFLOW                     │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Neobank Gets API Key
┌──────────────────────────────────┐
│ Admin generates API key for bank │ pk_abc123...
└───────────┬──────────────────────┘
            ↓
STEP 2: Neobank Backend Checks User
┌──────────────────────────────────┐
│ GET /api/users?id={userId}       │
│ (with API key)                   │
├──────────────────────────────────┤
│ User already verified?           │
├──────────────────────────────────┤
│ YES → Fast-track onboarding      │
│ NO  → Send to KYC flow           │
└──────────────────────────────────┘

STEP 3: After KYC, Register User
┌────────────────────────────────────┐
│ POST /api/users                    │
│ (with API key + user data)         │
├────────────────────────────────────┤
│ 1. Save to database                │
│ 2. Mint NFT on blockchain          │
│ 3. Return with blockchain data     │
└───────────┬────────────────────────┘
            ↓
STEP 4: User Gets NFT Certificate
┌────────────────────────────────────┐
│ NFT Minted on Polygon              │
│ ├─ Token ID                        │
│ ├─ Transaction Hash                │
│ ├─ Verifiable on Polygonscan       │
│ └─ Can be transferred to wallet    │
└────────────────────────────────────┘

STEP 5: User Portable Across Ecosystem
┌────────────────────────────────────┐
│ Any neobank can now:               │
│ ├─ Check ProofPass status          │
│ ├─ Verify NFT ownership            │
│ ├─ Fast-track user account         │
│ └─ Reduce friction                 │
└────────────────────────────────────┘
```

---

## 📈 Analytics & Monitoring

### Key Metrics

- **API Usage:** Track requests per neobank per day
- **Verification Rate:** % of users completing KYC
- **NFT Minting Success Rate:** % of successful blockchain transactions
- **Geographic Distribution:** Users by country/region
- **Tier Distribution:** % of users at each verification tier

### View Analytics

All analytics available in admin dashboard at:
```
https://proof-pass-verified-main.vercel.app/admin
```

---

## 🔒 Security Architecture

### API Key Security
- ✅ API keys stored with hashed secrets
- ✅ No hardcoded keys in code
- ✅ Keys tied to specific neobanks
- ✅ Request tracking per key
- ✅ Revocation capability

### Blockchain Security
- ✅ Uses Polygon mainnet (battle-tested)
- ✅ Immutable transaction records
- ✅ Public verification via Polygonscan
- ✅ NFT standard (ERC-721)
- ✅ No private key storage required

### Admin Dashboard Security
- ✅ Password-protected with admin token
- ✅ All actions logged
- ✅ API key secrets never displayed
- ✅ Only hashed values in database

### Future Improvements
- [ ] OAuth 2.0 for admin authentication
- [ ] Multi-signature admin confirmations
- [ ] Rate limiting per API key
- [ ] Data encryption at rest
- [ ] API key rotation scheduling
- [ ] Webhook event logging

---

## 🚀 Deployment Status

### Current Features Deployed ✅
- API key management system
- Blockchain NFT minting (Polygon)
- Admin dashboard with analytics
- Updated API endpoints
- Enhanced error handling

### Available at
```
Production: https://proof-pass-verified-main.vercel.app
Admin: https://proof-pass-verified-main.vercel.app/admin
API: https://proof-pass-verified-main.vercel.app/api/*
```

---

## 📞 Support & Troubleshooting

### API Key Issues

**Error: "Missing API key"**
- Solution: Add `Authorization: Bearer pk_...` header

**Error: "Invalid API key format"**
- Solution: API key must start with `pk_`

**Error: "Invalid or revoked API key"**
- Solution: Check if key is still active in admin dashboard

### Blockchain Issues

**NFT not minting**
- Check Polygonscan for transaction status
- Verify blockchain network is not congested
- Contact support if transaction fails

**Can't find transaction hash**
- Try on Polygonscan: `https://polygonscan.com/tx/{txHash}`
- Or check admin dashboard blockchain tab

### Admin Dashboard Issues

**Can't login to admin**
- Verify admin token is correct
- Use token format: `Bearer admin123`

**Stats not updating**
- Click refresh button on dashboard
- Check browser console for API errors

---

## 🎯 Next Steps for Partners

1. **Request API Key**
   - Contact ProofPass team
   - Provide neobank name
   - Get API key pair (public + secret)

2. **Integrate Backend**
   - Add ProofPass API calls
   - Implement fast-track logic
   - Test in staging environment

3. **Go Live**
   - Deploy to production
   - Monitor API usage
   - Track user metrics

4. **Optimize**
   - Analyze conversion rates
   - Adjust onboarding flow
   - Share feedback with ProofPass team
