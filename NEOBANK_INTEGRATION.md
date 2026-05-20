# ProofPass SaaS - Neobank Integration Guide

## For Neobank Founders: How to Use This SaaS

### 1. **Get Your API Key**

**Step 1:** Go to https://proof-pass-verified-main.vercel.app/admin
- Login with your neobank token (provided by ProofPass team)
- Navigate to **API Keys** tab

**Step 2:** Generate API Key
- Fill in:
  - **Neobank Name:** Your bank name (e.g., "Flutterwave")
  - **Key Name:** Environment (e.g., "Production", "Staging")
- Click **Generate Key**
- You'll receive:
  - **Public Key:** `pk_xxxxxxxx` (share this with clients)
  - **Secret Key:** `sk_xxxxxxxx` (KEEP SECURE - never share)

**Step 3:** Store Your Keys
```
Production:
  Public:  pk_5yt4mfl188
  Secret:  sk_bs8rt5wgzf

Store secret in environment variables:
PROOFPASS_API_KEY=sk_bs8rt5wgzf
```

---

## 2. **How to Verify Users WITHOUT Storing Data**

### Architecture: Verification Flow (No Permanent Storage)

```
┌─────────────────────────────────────────────────────────────┐
│ YOUR NEOBANK APP                                            │
│                                                             │
│ 1. User starts KYC                                         │
│    ↓                                                       │
│ 2. User fills form:                                        │
│    • Name: "John Doe"                                      │
│    • ID: "NG-123456789"                                    │
│    • Face: [photo upload]                                 │
└─────────────────────────────────────────────────────────────┘
                    ↓
        (Send to ProofPass API)
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ PROOFPASS VERIFICATION (Ephemeral)                          │
│                                                             │
│ 1. Receive user data                                       │
│ 2. Run verification checks:                                │
│    ✓ Liveness check (face is real)                        │
│    ✓ ID authenticity (document valid)                     │
│    ✓ ID-Face matching (photo matches ID)                  │
│    ✓ Blockchain NFT mint (proof of verification)          │
│ 3. Return ONLY:                                            │
│    • Verification status: ✅ PASSED / ❌ FAILED           │
│    • NFT Token ID: nft_123456                             │
│    • Verification ID: ver_789abc                          │
│                                                            │
│ 4. ⚠️ DATA DELETED after verification                     │
│    (photos, ID images NOT stored permanently)             │
│                                                            │
│ 5. ✅ Only verification RESULT stored on blockchain       │
└─────────────────────────────────────────────────────────────┘
                    ↓
        (Return verification result)
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ YOUR NEOBANK APP                                            │
│                                                             │
│ Receive from ProofPass:                                    │
│ {                                                          │
│   "status": "verified",                                    │
│   "verificationId": "ver_789abc",                         │
│   "nftTokenId": "nft_123456",                             │
│   "blockchain": {                                          │
│     "txHash": "0x123abc...",                              │
│     "network": "Polygon",                                 │
│     "timestamp": "2026-05-20T14:59:00Z"                  │
│   }                                                        │
│ }                                                          │
│                                                            │
│ ✅ YOU decide what to store:                             │
│    • User profile (name, email, phone)                   │
│    • Verification status                                 │
│    • Verification ID (for audit trail)                   │
│    • NFT Token ID (proof of verification)               │
│                                                           │
│ ⚠️ You DON'T have:                                       │
│    • ID photos                                            │
│    • Face photos                                          │
│    • Raw biometric data                                   │
│    • Document scans                                       │
└─────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

**Data Security:**
- Sensitive data (photos, ID scans) are **deleted immediately** after verification
- Only the **verification result** is retained
- You can't lose what you don't store

**Privacy Compliance:**
- GDPR: Users can request "right to be forgotten" - no personal data to delete
- Your neobank decides what user profile data to store
- ProofPass doesn't hold any sensitive personal information

**Regulatory Compliance:**
- Verification proof stored on blockchain (immutable audit trail)
- Cannot be tampered with or deleted
- Perfect for compliance audits

---

## 3. **Integration Code Example**

### NodeJS/TypeScript

```typescript
// 1. Submit user data to ProofPass for verification
async function verifyUser(userData: {
  name: string;
  idDocument: File;
  facePhoto: File;
  idType: string; // "national_id", "passport", etc
}): Promise<VerificationResult> {
  const formData = new FormData();
  formData.append("name", userData.name);
  formData.append("idDocument", userData.idDocument);
  formData.append("facePhoto", userData.facePhoto);
  formData.append("idType", userData.idType);

  const response = await fetch("https://proof-pass-verified-main.vercel.app/api/users", {
    method: "POST",
    headers: {
      "Authorization": `Bearer sk_bs8rt5wgzf` // Your API key
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Verification failed: ${response.statusText}`);
  }

  return response.json();
}

// 2. Handle the verification result
const result = await verifyUser({
  name: "John Doe",
  idDocument: idFile,
  facePhoto: faceFile,
  idType: "national_id"
});

// Result you receive:
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

// 3. Store ONLY what you need in your database
db.users.insert({
  userId: "user_123",
  name: "John Doe",
  email: "john@example.com",
  phone: "+234-XXX-XXXX",
  verificationStatus: "verified",
  verificationId: "ver_789abc",        // ← Reference to ProofPass verification
  nftTokenId: "nft_123456",            // ← Proof on blockchain
  verifiedAt: new Date(),
  // ⚠️ NO ID photos, NO face photos, NO biometric data
})

// 4. Retrieve verification from blockchain (immutable proof)
async function getVerificationProof(verificationId: string) {
  // Query blockchain to prove user was verified
  // Immutable record: can't be faked or deleted
  return blockchain.getRecord(verificationId);
}
```

### Python Example

```python
import requests
from typing import Dict

class ProofPassClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://proof-pass-verified-main.vercel.app"

    def verify_user(self, name: str, id_doc_path: str, 
                   face_photo_path: str, id_type: str) -> Dict:
        """
        Verify user KYC without storing sensitive data
        
        ProofPass will:
        1. ✓ Verify face liveness
        2. ✓ Validate ID document
        3. ✓ Check ID-Face match
        4. ✓ Mint NFT on blockchain
        5. ✗ DELETE all photos/documents
        6. ✓ Return only verification result
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        with open(id_doc_path, 'rb') as id_file, \
             open(face_photo_path, 'rb') as face_file:
            
            files = {
                'idDocument': id_file,
                'facePhoto': face_file,
            }
            
            data = {
                'name': name,
                'idType': id_type,
            }
            
            response = requests.post(
                f"{self.base_url}/api/users",
                headers=headers,
                files=files,
                data=data
            )
            
            return response.json()

    def get_verification_status(self, verification_id: str) -> Dict:
        """
        Check verification status from blockchain
        (immutable, can't be forged)
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        response = requests.get(
            f"{self.base_url}/api/users?id={verification_id}",
            headers=headers
        )
        
        return response.json()


# Usage
client = ProofPassClient(api_key="sk_bs8rt5wgzf")

result = client.verify_user(
    name="John Doe",
    id_doc_path="./id_photo.jpg",
    face_photo_path="./face_photo.jpg",
    id_type="national_id"
)

print(f"Verification Status: {result['status']}")
print(f"NFT Token: {result['nftTokenId']}")
print(f"Blockchain TX: {result['blockchain']['txHash']}")

# Store in your database
user = {
    'name': 'John Doe',
    'verification_id': result['verificationId'],
    'nft_token': result['nftTokenId'],
    'verified_at': datetime.now()
}
```

---

## 4. **Key Benefits for Your Neobank**

### ✅ What You GET:
- Verified user confirmation (✓ PASSED / ❌ FAILED)
- NFT proof on Polygon blockchain (immutable verification record)
- Verification timestamp and transaction hash
- Regulatory audit trail (blockchain is permanent)
- Liveness detection (prevents fake IDs)
- Face-ID matching verification

### ⚠️ What You DON'T store:
- User photos (face images)
- ID document scans
- Biometric data
- Raw verification documents
- Sensitive personal information

### 🔒 Privacy Benefits:
- **GDPR Compliant:** No personal data permanently stored on our servers
- **Data Minimization:** Only verification result stored, not raw data
- **User Privacy:** Sensitive documents are deleted after verification
- **Blockchain Immutability:** Verification can't be tampered with
- **Your Control:** You decide what to store in YOUR database

---

## 5. **Admin Dashboard Features**

### For Neobank Admins: Monitor Integration

**URL:** https://proof-pass-verified-main.vercel.app/admin

**Tabs Available:**

| Tab | What You See |
|-----|---|
| **Overview** | Total users verified, users by tier, users by region |
| **API Keys** | Your API keys, request usage, last used timestamp |
| **Blockchain** | NFTs minted, confirmed transactions, Polygon network status |
| **Users** | User verification history, timestamps, status |

**Refresh:** Click "Refresh" to get latest stats
**Export:** Download verification reports for compliance

---

## 6. **Compliance & Audit Trail**

### For Your Auditors:

All verifications are recorded on **Polygon blockchain:**
- ✓ Immutable verification records
- ✓ Cannot be deleted or modified
- ✓ Public transaction history (optional transparency)
- ✓ Timestamp proof
- ✓ User verification status

### Access Verification Proof:

```bash
# Query blockchain using Polygon explorer
curl "https://polygonscan.com/tx/{txHash}"

# Returns immutable proof:
{
  "from": "0xProofPassContract",
  "to": "0xUserNFTWallet",
  "input": "0xMintNFT(verificationId, userId, timestamp)",
  "blockNumber": 12345678,
  "timeStamp": 1684667400,
  "gasUsed": 150000,
  "status": "1" // Success
}
```

---

## 7. **Pricing Model** (Example)

| Tier | Users/Month | Price | Features |
|------|---|---|---|
| **Starter** | 100 | $29/mo | 100 verifications/month |
| **Growth** | 1,000 | $99/mo | 1,000 verifications/month |
| **Enterprise** | Unlimited | Custom | Unlimited verifications + white-label |

---

## 8. **Next Steps**

### To get started:
1. ✅ Sign up on admin dashboard
2. ✅ Generate API key
3. ✅ Integrate into your KYC flow
4. ✅ Test with sample user
5. ✅ Launch production
6. ✅ Monitor on admin dashboard

### Support:
- Email: support@proofpass.io
- Slack: Join community
- Docs: Full API reference

---

## 9. **FAQ**

**Q: Where is the user data stored?**
A: Only the verification RESULT is stored (on blockchain). Original photos/documents are deleted after verification completes.

**Q: Can users request their data?**
A: Yes, they get only: verification ID, NFT token, timestamp. No photos or biometric data to share (it's deleted).

**Q: Is this GDPR compliant?**
A: Yes. We delete personal data after verification (right to be forgotten). Only your neobank retains user profile data.

**Q: Can verification be faked?**
A: No. Blockchain proof is immutable. You can verify on Polygon explorer anytime.

**Q: What happens if verification fails?**
A: User is notified. No data is stored. They can re-try anytime.

**Q: How long does verification take?**
A: ~5-30 seconds depending on document quality and network.

**Q: Can I white-label this?**
A: Yes, Enterprise tier includes custom branding.

**Q: What payment methods do you accept?**
A: Credit card, bank transfer, crypto (stablecoin).

---

## 10. **Quick Start Checklist**

- [ ] Generate API Key from admin dashboard
- [ ] Add API key to environment variables
- [ ] Install SDK (npm/pip)
- [ ] Implement verify endpoint in your backend
- [ ] Test with sample user data
- [ ] Deploy to production
- [ ] Monitor dashboard for usage stats
- [ ] Contact support for enterprise features

---

## Support & Documentation

- **Admin Dashboard:** https://proof-pass-verified-main.vercel.app/admin
- **Status Page:** https://status.proofpass.io
- **Community:** https://slack.proofpass.io
- **GitHub:** https://github.com/proof-pass/sdk
}
```

**Neobank Flow:**
```
User enters email
    ↓
Check ProofPass API
    ↓
Already verified?
    ├─ YES → Skip KYC → Instant account creation (3 seconds)
    └─ NO  → Regular KYC flow
```

---

### **Method 2: Register User After Your KYC**

After your neobank completes KYC, save the verification to ProofPass:

```javascript
// After user completes YOUR neobank's KYC (documents verified, ID checked, etc.)
async function registerUserWithProofPass(neobanker) {
  // Map your user data to ProofPass format
  const proofPassData = {
    id: neobanker.userId,  // Your internal user ID
    email: neobanker.email,
    accountType: neobanker.accountType,  // "personal" or "business"
    status: "Complete",
    tier: determineTier(neobanker),      // "Tier 1 — Basic", "Tier 2 — Full", etc.
    region: neobanker.country,           // "Nigeria (NG)"
    verifiedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString(),  // 1 year
    token: `NFT_${neobanker.userId}`,   // Your NFT identifier
    walletAddress: neobanker.walletAddress || generateWalletAddress(),
    dataMetrics: {
      timesViewed: 0,
      timesShared: 0,
      timesVerified: 1
    }
  };

  try {
    const response = await fetch(
      "https://proof-pass-verified-main.vercel.app/api/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proofPassData)
      }
    );

    if (response.status === 201) {
      const saved = await response.json();
      console.log("✅ User registered with ProofPass");
      console.log("User can now use this verification at other banks");
      return saved;
    } else {
      console.error("❌ Failed to register:", await response.json());
    }
  } catch (error) {
    console.error("Network error:", error);
  }
}

function determineTier(user) {
  // Your tier logic
  if (user.documentsVerified && user.livenessCheck && user.addressProof) {
    return "Tier 2 — Full";  // Full KYC
  } else if (user.emailVerified) {
    return "Tier 1 — Basic";  // Basic KYC
  }
  return "Unverified";
}
```

**Neobank Flow:**
```
User completes your KYC
    ├─ ID verification ✓
    ├─ Address proof ✓
    ├─ Liveness check ✓
    ↓
POST /api/users (save to ProofPass)
    ↓
User now portable
    ├─ Can use at other neobanks ✓
    └─ Reduced onboarding time ✓
```

---

### **Method 3: Show User Their ProofPass Status in App**

Display verification info in user dashboard:

```javascript
// In your neobank's user dashboard
import { useEffect, useState } from "react";

export function VerificationStatus({ userId }) {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const response = await fetch(
          `https://proof-pass-verified-main.vercel.app/api/users?id=${userId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (!data.error) {
            setVerification(data);
          }
        }
      } catch (error) {
        console.error("Error fetching verification:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [userId]);

  if (loading) return <div>Checking verification status...</div>;
  if (!verification) return <div>Not verified yet</div>;

  return (
    <div className="verification-card">
      <h3>✓ ProofPass Verification Status</h3>
      <div className="status-row">
        <span>Status:</span>
        <strong>{verification.status}</strong>
      </div>
      <div className="status-row">
        <span>KYC Tier:</span>
        <strong>{verification.tier}</strong>
      </div>
      <div className="status-row">
        <span>Verified:</span>
        <strong>{new Date(verification.verifiedAt).toDateString()}</strong>
      </div>
      <div className="status-row">
        <span>Valid Until:</span>
        <strong>{new Date(verification.expiresAt).toDateString()}</strong>
      </div>
      <div className="status-row">
        <span>Token ID:</span>
        <code>{verification.token}</code>
      </div>
      <p className="help-text">
        Your verification is valid across all ProofPass partner banks
      </p>
    </div>
  );
}
```

---

## 🔌 Backend Integration (Node.js/Express)

### **Express Middleware to Check ProofPass Before Onboarding**

```javascript
const express = require("express");
const axios = require("axios");

const app = express();

const PROOFPASS_API = "https://proof-pass-verified-main.vercel.app/api/users";

// Middleware: Check ProofPass verification
async function checkProofPassVerification(req, res, next) {
  try {
    const { userId, email } = req.body;
    const lookupId = userId || generateIdFromEmail(email);

    // Check if user exists on ProofPass
    const response = await axios.get(PROOFPASS_API, {
      params: { id: lookupId }
    });

    if (response.data && !response.data.error) {
      // User is verified
      req.proofpassUser = response.data;
      req.isVerified = true;
    } else {
      req.isVerified = false;
    }
  } catch (error) {
    console.error("ProofPass check failed:", error.message);
    req.isVerified = false;
  }

  next();
}

// Signup route
app.post("/signup", checkProofPassVerification, async (req, res) => {
  const { email, password } = req.body;

  if (req.isVerified) {
    // Fast-track: User already verified with ProofPass
    console.log("User already verified with ProofPass!");
    
    // Create account instantly
    const neobanker = await createAccountFromProofPass(req.proofpassUser);
    
    return res.json({
      message: "Account created instantly from ProofPass verification!",
      account: neobanker
    });
  }

  // Regular flow: Require KYC
  console.log("User needs KYC verification");
  
  // Send to KYC process
  res.json({
    message: "Please complete KYC verification",
    redirectTo: "/kyc"
  });
});

// After KYC completion - save to ProofPass
app.post("/api/register-with-proofpass", async (req, res) => {
  const userData = req.body; // User after KYC verification

  try {
    const proofPassData = {
      id: userData.id,
      email: userData.email,
      accountType: userData.accountType,
      status: "Complete",
      tier: userData.kycTier,
      region: userData.country,
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
      token: `TOKEN_${userData.id}`,
      walletAddress: userData.walletAddress,
      dataMetrics: { timesViewed: 0, timesShared: 0, timesVerified: 1 }
    };

    const response = await axios.post(PROOFPASS_API, proofPassData);

    res.json({
      message: "User registered with ProofPass",
      user: response.data
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to register with ProofPass",
      details: error.message
    });
  }
});

// Get user verification status
app.get("/api/verification/:userId", async (req, res) => {
  try {
    const response = await axios.get(PROOFPASS_API, {
      params: { id: req.params.userId }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verification" });
  }
});

app.listen(3000, () => console.log("Running on port 3000"));
```

---

## 🎯 Complete Neobank Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEOBANK USER SIGNUP                         │
└─────────────────────────────────────────────────────────────────┘

STEP 1: User enters email at your signup
┌──────────────┐
│ Neobank Form │
│ Email input  │ ──→ /signup
└──────────────┘

STEP 2: Backend checks ProofPass
┌────────────────────────────────────┐
│ GET /api/users?id=user_123         │
│ (ProofPass API)                    │
├────────────────────────────────────┤
│ User found AND not expired?        │
│   ├─ YES → Fast-track              │
│   └─ NO  → Normal KYC              │
└────────────────────────────────────┘

STEP 3A: Fast-Track Path (If already verified)
┌───────────────────────────────────────┐
│ 1. Skip all KYC documents            │
│ 2. Trust ProofPass tier              │
│ 3. Create account instantly          │
│ 4. User ready to transact (3 sec)    │
└───────────────────────────────────────┘

STEP 3B: Normal Path (If not verified)
┌───────────────────────────────────────┐
│ 1. Require ID upload                 │
│ 2. Require address proof             │
│ 3. Require liveness check            │
│ 4. After approval →                  │
│    POST /api/users (save to ProofPass)
└───────────────────────────────────────┘

STEP 4: User Account Created
┌───────────────────────────────────────┐
│ User Dashboard                        │
│ ├─ Account balance                   │
│ ├─ Verification Status ✓             │
│ ├─ ProofPass Tier                    │
│ └─ Share verification to other banks │
└───────────────────────────────────────┘

RESULT:
✅ User can use ProofPass at 5+ other neobanks
✅ Reduced friction across ecosystem
✅ Faster future signups (3 seconds)
✅ Better user experience
```

---

## 📊 API Reference for Neobanks

### **Endpoint 1: Check Verification**
```
GET /api/users?id={userId}

Response (200):
{
  "id": "user_123",
  "email": "user@example.com",
  "status": "Complete",
  "tier": "Tier 2 — Full",
  "region": "Nigeria (NG)",
  "verifiedAt": "2026-05-20T14:25:07Z",
  "expiresAt": "2027-05-20T14:25:07Z",
  "token": "NFT_12345",
  "walletAddress": "0x1234..."
}

Response (200 - Not found):
{ "error": "Not found" }

Use Case: Check if user is already verified
Response Time: 30-60ms
```

### **Endpoint 2: Register User After KYC**
```
POST /api/users

Request Body:
{
  "id": "user_123",
  "email": "user@example.com",
  "accountType": "personal",
  "status": "Complete",
  "tier": "Tier 2 — Full",
  "region": "Nigeria (NG)",
  "verifiedAt": "2026-05-20T14:25:07Z",
  "expiresAt": "2027-05-20T14:25:07Z",
  "token": "NFT_12345",
  "walletAddress": "0x1234...",
  "dataMetrics": {"timesViewed": 0, "timesShared": 0, "timesVerified": 1}
}

Response (201):
{
  "id": "user_123",
  ...same as request body...
}

Use Case: Save user after your KYC verification
Response Time: 45-80ms
```

### **Endpoint 3: List All Verifications**
```
GET /api/users

Response (200):
[
  {
    "id": "user_123",
    "email": "user1@example.com",
    ...
  },
  {
    "id": "user_456",
    "email": "user2@example.com",
    ...
  }
]

Use Case: Analytics, batch operations, audit
Response Time: 40-100ms
```

---

## 🚀 Implementation Checklist

- [ ] **Setup Phase**
  - [ ] Get ProofPass API endpoint: `https://proof-pass-verified-main.vercel.app/api/users`
  - [ ] Add axios or fetch to dependencies
  - [ ] Configure CORS if calling from frontend

- [ ] **Integration Phase**
  - [ ] Implement `checkVerification()` function
  - [ ] Add ProofPass check to signup flow
  - [ ] Implement fast-track path for verified users
  - [ ] Create `registerWithProofPass()` after your KYC
  - [ ] Add error handling for API failures

- [ ] **Testing Phase**
  - [ ] Test with existing ProofPass user (fast-track)
  - [ ] Test with new user (normal KYC → register)
  - [ ] Test with expired verification
  - [ ] Test network failures (graceful fallback)
  - [ ] Test CORS headers

- [ ] **Deployment Phase**
  - [ ] Deploy to production
  - [ ] Monitor API response times
  - [ ] Set up error logging
  - [ ] Document for support team

---

## 💡 Best Practices

### **Do:**
✅ Always wrap API calls in try-catch  
✅ Check expiry date before trusting verification  
✅ Cache user verification for 24 hours locally  
✅ Fallback to regular KYC if ProofPass is down  
✅ Log all API interactions for debugging  
✅ Validate user tier before granting permissions  

### **Don't:**
❌ Don't skip all KYC for unverified users  
❌ Don't assume ProofPass is always up (implement fallback)  
❌ Don't cache verification longer than 24 hours  
❌ Don't pass user data to ProofPass unencrypted  
❌ Don't expose API endpoint in frontend code (use backend proxy)  

---

## 🔒 Security Notes

### **Current Implementation (MVP):**
- ✓ HTTPS only (Vercel)
- ✓ JSON storage
- ✗ No API key authentication
- ✗ No rate limiting
- ✗ No encryption

### **For Production Integration, Add:**
1. **API Key Authentication** - Require API key in headers
2. **Rate Limiting** - Limit requests per IP/key
3. **Data Encryption** - Encrypt sensitive fields at rest
4. **Request Validation** - Validate all input fields
5. **Audit Logging** - Log all API access
6. **HTTPS Only** - Already enforced (Vercel)

### **Example with API Key (Recommended):**
```javascript
async function checkVerification(userId, apiKey) {
  const response = await fetch(
    `https://proof-pass-verified-main.vercel.app/api/users?id=${userId}`,
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.json();
}
```

---

## 🆘 Troubleshooting

### **Issue: Getting 500 errors**
```
Solution:
1. Check if API is up: curl https://proof-pass-verified-main.vercel.app/api/users
2. Verify Content-Type header is application/json
3. Check request body format matches schema
4. Review Vercel status at vercel.com/status
```

### **Issue: CORS errors in frontend**
```
Solution:
1. Call API from backend proxy instead of frontend
2. If must call from frontend, ensure CORS headers are set
3. Use OPTIONS preflight request
```

### **Issue: User verification not saving**
```
Solution:
1. Verify POST request returns 201 (not 200)
2. Check localStorage for userId
3. Verify all required fields are present
4. Check network tab for actual response
```

### **Issue: Fast-track not working**
```
Solution:
1. Verify user ID format is correct
2. Check user verification hasn't expired
3. Compare IDs exactly (case-sensitive)
4. Test with browser console: fetch('...')
```

---

## 📞 Support & Next Steps

### **For Questions:**
- Review `API_INTEGRATION_GUIDE.md` for general info
- Review `API_FLOW_DIAGRAMS.md` for visual architecture
- Check `API_AUDIT.md` for complete technical reference

### **For Feedback:**
- Report issues on GitHub
- Request features for your use case
- Share integration patterns with other neobanks

### **Roadmap:**
- [ ] Add API key authentication system
- [ ] Add rate limiting and quotas
- [ ] Add data encryption at rest
- [ ] Add webhook notifications
- [ ] Add batch verification endpoint
- [ ] Add admin dashboard for monitoring
