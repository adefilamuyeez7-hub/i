# ProofPass Neobank Integration Documentation

## 🏦 Quick Overview

ProofPass provides **portable KYC verification** that neobanks can integrate in **3 ways:**

1. **Verify Existing Users** - Check if a user is already verified with ProofPass (instant onboarding)
2. **Register New Users** - Save ProofPass verifications to database after your KYC
3. **Share Verification** - Enable users to use their ProofPass verification across multiple banks

---

## 📋 Integration Methods

### **Method 1: Check If User Already Has ProofPass Verification**

When a user tries to sign up, check if they're already verified:

```javascript
// User signs up with email on your neobank
const userEmail = "john@example.com";
const userId = generateUserIdFromEmail(userEmail); // your method

// Call ProofPass API
async function checkExistingVerification() {
  try {
    const response = await fetch(
      `https://proof-pass-verified-main.vercel.app/api/users?id=${userId}`
    );
    
    if (response.ok) {
      const user = await response.json();
      
      // Check if not an error response
      if (!user.error) {
        console.log("✅ User already verified with ProofPass!");
        console.log(`Tier: ${user.tier}`);
        console.log(`Valid until: ${new Date(user.expiresAt).toDateString()}`);
        
        // Skip your KYC, fast-track onboarding
        return true;
      }
    }
    
    console.log("❌ User needs KYC verification");
    return false;
  } catch (error) {
    console.error("Error checking ProofPass:", error);
    return false; // Fallback to regular KYC
  }
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
