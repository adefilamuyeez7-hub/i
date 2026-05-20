# ProofPass for Neobank Founders - Quick Reference

## TL;DR - Your 3-Step Integration

### Step 1: Get API Key from Admin Dashboard
```
Go to: https://proof-pass-verified-main.vercel.app/admin
Login with: admin123
Navigate to: API Keys tab
Generate: Public key (pk_*) + Secret key (sk_*)
```

### Step 2: Send User Data to ProofPass
```typescript
// Your neobank app receives user KYC submission
POST /api/users {
  name: "John Doe",
  idDocument: [file],        // ID photo/scan
  facePhoto: [file],         // Selfie/face photo
  idType: "national_id"
}

Headers: Authorization: Bearer sk_YOUR_SECRET_KEY
```

### Step 3: Receive Only Verification Result
```json
// ProofPass deletes photos, returns only:
{
  "status": "verified",
  "verificationId": "ver_789abc",
  "nftTokenId": "nft_123456",
  "blockchain": {
    "txHash": "0x123abc...",
    "network": "Polygon",
    "timestamp": "2026-05-20T14:59:00Z"
  }
}

// Store in your DB:
- User name, email, phone (you collected)
- verificationId, nftTokenId (from ProofPass)
- verification status (verified/failed)

// DON'T store:
- ID photos ❌ (ProofPass deletes them)
- Face photos ❌ (ProofPass deletes them)
- Biometric data ❌ (ProofPass deletes them)
```

---

## The Problem You're Solving

### Traditional KYC (What You Probably Do Now)
```
User submits KYC
        ↓
Your servers store:
  ✓ ID scans
  ✓ Face photos
  ✓ Biometric data
  ✓ Personal documents
        ↓
Data breach risk 💥
GDPR liability ⚖️
Storage costs 💰
```

### ProofPass KYC (What You'll Do With Us)
```
User submits KYC
        ↓
ProofPass verifies data
  ✓ Face liveness check
  ✓ ID authenticity check
  ✓ Face-ID match check
  ✓ Mint blockchain proof
        ↓
ProofPass DELETES original data 🗑️
        ↓
You receive only:
  ✓ Verification result (verified/failed)
  ✓ Verification ID (reference)
  ✓ NFT Token (blockchain proof)
        ↓
You store ONLY profile + verification ID
No sensitive data = No risk 🔒
```

---

## Data Privacy Architecture Explained

### What ProofPass DOES Store (Temporarily)
```
During verification (5-30 seconds):
- Receives: ID photo, face photo, personal data
- Processes: Verification algorithms
- Stores: Temporarily in memory during processing
- Then: ALL DELETED immediately after

After verification:
- Only stores: Verification result + NFT mint record
- On blockchain: Immutable proof of verification
- User data: Completely removed
```

### What ProofPass DOESN'T Store
```
❌ ID photos - DELETED
❌ Face photos - DELETED
❌ Raw identity data - DELETED
❌ Biometric features - DELETED
❌ Document scans - DELETED
❌ Personal information - DELETED

Only stores:
✓ Verification status (passed/failed)
✓ Verification timestamp
✓ NFT Token ID
✓ Blockchain transaction hash
```

### What YOU Store in Your Database
```
You decide based on:
- Your regulatory requirements
- Your business needs
- Your risk tolerance

Recommended minimum:
{
  userId: "user_123",
  name: "John Doe",
  email: "john@example.com",
  phone: "+234-XXX-XXXX",
  country: "Nigeria",
  verificationStatus: "verified",
  verificationId: "ver_789abc",      // Reference to ProofPass
  nftTokenId: "nft_123456",          // Proof on blockchain
  verifiedAt: "2026-05-20T14:59:00Z",
  accountStatus: "active"
}

You do NOT need:
- ID scans (can't fake verification - it's on blockchain)
- Face photos (can't fake liveness - already verified)
- Biometric data (blockchain proof is immutable)
```

---

## Compliance Benefits for Neobanks

### GDPR Compliance
```
Requirement: Right to be forgotten
Your data: Store only what you need
ProofPass: Deletes user data on request
Result: ✅ GDPR compliant

User says: "Delete my data"
Your action: Delete from your database
ProofPass: No user data to delete (already gone)
Compliance: ✅ Complete
```

### Data Localization
```
If Nigeria requires data localization:
- ProofPass: Verification happens in cloud
- Your DB: Stores only in Nigeria
- Result: ✅ Fully compliant

No conflict because ProofPass doesn't store
personal data - only verification results
```

### Audit Trail
```
Every verification is immutable on blockchain:
- Verification timestamp
- Verification status
- User identifier
- Transaction hash

Regulators can verify:
→ Polygonscan explorer
→ See immutable record
→ No tampering possible
```

---

## How the Blockchain Proof Works

### Example: Customer Verification Audit

1. **Customer asks:** "Prove John Doe was verified"

2. **You provide:** Verification ID (`ver_789abc`)

3. **Regulator checks:**
```bash
# On Polygon blockchain
https://polygonscan.com/tx/0x123abc...

Immutable record shows:
{
  timestamp: 1684667400 (May 20, 2026)
  event: "UserVerified"
  verificationId: "ver_789abc"
  userId: "user_123"
  status: "PASSED"
  nftMinted: "nft_123456"
}

✅ This cannot be faked
✅ This cannot be deleted
✅ Proof forever
```

4. **Audit result:** ✅ VERIFIED

---

## Cost Comparison

### Traditional KYC (Your Cost)
```
Infrastructure:
  - Secure servers: $5,000/mo
  - Data encryption: $2,000/mo
  - Backups: $1,000/mo
  - Compliance: $3,000/mo
  - Staff: $50,000/mo
Subtotal: ~$61,000/mo

Per-user cost for 10,000 users:
$61,000 / 10,000 = $6.10/user/month
Annual: $73.20 per user
```

### ProofPass KYC (Shared Cost)
```
SaaS subscription:
  Growth tier: $99/mo (1,000 users/month)
  
Pricing model:
  - 1-100 users: $29/mo
  - 101-1,000 users: $99/mo
  - 1,001+ users: Custom

Per-user cost for 1,000 users:
$99 / 1,000 = $0.099/user/month
Annual: $1.19 per user

Your savings: $72.01 per user per year 💰
```

---

## Admin Dashboard Monitoring

### What You Can Track

**Overview Tab:**
- Total users verified (real-time)
- Users by verification tier
- Users by geographic region
- Verification success rate

**API Keys Tab:**
- All your API keys
- Usage statistics
- Request volume
- Last used timestamp
- Revoke compromised keys

**Blockchain Tab:**
- NFTs minted
- Confirmed transactions
- Failed transactions
- Network status (Polygon)
- Contract address
- Explorer link

**Users Tab:**
- All verified users
- Verification timestamp
- Verification status
- NFT token per user

---

## Real-World Example: Flutterwave Integration

### Scenario: Flutterwave Using ProofPass

```
1. Customer Flow:
   User → Flutterwave app
        → Starts KYC
        → Takes selfie + ID photo
        → Submits to Flutterwave

2. Flutterwave Backend:
   POST https://proof-pass-verified-main.vercel.app/api/users
   {
     name: "Amara Okonkwo",
     idDocument: [scan],
     facePhoto: [selfie],
     idType: "national_id"
   }
   Headers: Authorization: Bearer sk_flutterwave_prod_key

3. ProofPass Processing:
   ✓ Checks face liveness (not a photo of photo)
   ✓ Validates ID authenticity
   ✓ Matches face to ID
   ✓ Mints NFT on Polygon
   ✓ Deletes all photos
   ✓ Returns only: verification result

4. Response to Flutterwave:
   {
     "status": "verified",
     "verificationId": "ver_okonkwo_001",
     "nftTokenId": "nft_0123456789",
     "blockchain": {
       "txHash": "0x...",
       "timestamp": "2026-05-20T15:00:00Z"
     }
   }

5. Flutterwave Stores:
   {
     userId: "amare_okonkwo_001",
     name: "Amara Okonkwo",
     email: "amara@email.com",
     phone: "+234-701-XXX-XXXX",
     verificationStatus: "verified",
     verificationId: "ver_okonkwo_001",
     nftTokenId: "nft_0123456789",
     accountStatus: "active"
   }

6. User Can Now:
   ✅ Trade on Flutterwave
   ✅ Use full features
   ✅ Withdrawal limit: Tier 2

7. Audit Trail:
   Regulators can check:
   → Verification ID
   → Blockchain proof
   → Immutable timestamp
   → No tampering possible
```

---

## Getting Started Checklist

- [ ] Read this guide completely
- [ ] Review NEOBANK_INTEGRATION.md for code examples
- [ ] Go to admin dashboard: https://proof-pass-verified-main.vercel.app/admin
- [ ] Login with admin token
- [ ] Generate your API key
- [ ] Store secret key in environment variables
- [ ] Read Python/NodeJS SDK examples
- [ ] Implement verify endpoint in your backend
- [ ] Test with sample user
- [ ] Deploy to production
- [ ] Monitor admin dashboard
- [ ] Contact support for enterprise features

---

## Key Takeaways

✅ **You verify users without storing sensitive data**
✅ **ProofPass handles all verification heavy lifting**
✅ **Blockchain proof can't be faked or deleted**
✅ **Your data storage costs dramatically reduced**
✅ **GDPR and compliance automatically handled**
✅ **Users get verified proof they can share**

---

## Support

Need help?
- **Email:** support@proofpass.io
- **Admin Dashboard:** https://proof-pass-verified-main.vercel.app/admin
- **Integration Docs:** NEOBANK_INTEGRATION.md (in your repo)
- **GitHub:** https://github.com/proof-pass/sdk
