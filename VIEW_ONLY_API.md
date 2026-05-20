# ProofPass "View Only" API - Access Data Without Storing

## The Answer to Your Question

**Yes, neobanks can:**
- ✅ **View** ID and biometric data anytime
- ✅ **Access** it from ProofPass servers on-demand
- ✅ **NOT store** it on their servers
- ✅ **Read-only** access (can't download, copy, or share)

---

## How It Works

### Traditional Approach (What Most Do)
```
User KYC → Store everything → Liability forever
           ├─ ID photos
           ├─ Selfies
           ├─ Biometric data
           ├─ Risk of breaches
           └─ GDPR complications
```

### ProofPass "View Only" Approach (What You Get)
```
User KYC → ProofPass stores encrypted → Neobank can view anytime
                                         └─ But can't download
                                         └─ But can't store
                                         └─ But can't share
                                         └─ Only read-only access
```

---

## API Endpoints

### 1. **View Verification Details** (Anytime, Any Number of Times)

```bash
# Neobank calls this endpoint:
GET /api/verification-details?id=ver_789abc

Headers:
  Authorization: Bearer admin123
  X-Neobank-Name: Flutterwave

Response:
{
  "verificationId": "ver_789abc",
  "userId": "user_123",
  "status": "verified",
  "verifiedAt": "2026-05-20T14:59:00Z",
  "expiresAt": "2026-06-20T14:59:00Z",
  "matchScore": 0.98,
  
  "idData": {
    "type": "national_id",
    "country": "Nigeria",
    "issueDate": "2020-01-15",
    "expiryDate": "2030-01-15"
    // ❌ NOT included: Actual ID number (privacy)
  },
  
  "faceData": {
    "livenessConfidence": 0.99
    // ❌ NOT included: Face biometric template (privacy)
  },
  
  "viewHistory": [
    {
      "viewedAt": "2026-05-20T14:59:10Z"
    },
    {
      "viewedAt": "2026-05-20T16:30:00Z"
    }
  ],
  
  "restrictions": {
    "canDownload": false,
    "canStore": false,
    "canShare": false,
    "accessibleFor": "2026-06-20T14:59:00Z"
  }
}
```

---

## Real Use Case: Neobank Customer Service

### Scenario: Customer Calls Support

```
Customer: "I was verified yesterday. Can you confirm?"

Support Agent Flow:
1. Get customer's verificationId from database
   verificationId: "ver_789abc"

2. Call ProofPass API:
   GET /api/verification-details?id=ver_789abc
   Auth: Bearer admin123

3. ProofPass returns:
   {
     status: "verified",
     verifiedAt: "2026-05-20T14:59:00Z",
     matchScore: 0.98
   }

4. Support agent tells customer:
   "Yes, you were successfully verified at 2:59 PM yesterday.
    Your verification score was 98%."

5. What happens to the data?
   ✅ Neobank views it (no download)
   ✅ Neobank doesn't store it (just confirms)
   ✅ Data stays on ProofPass servers (encrypted)
   ✅ Each view is logged (audit trail)
   ✅ Expires in 30 days automatically
```

---

## Another Use Case: Regulatory Audit

### Scenario: Auditor Checks Verification

```
CBN Auditor: "Prove this user was verified"

Your Process:
1. You show auditor: verificationId = "ver_789abc"

2. You call: GET /api/verification-details?id=ver_789abc

3. ProofPass returns verification proof:
   ✓ Verified on: 2026-05-20
   ✓ Match score: 98%
   ✓ All checks passed

4. You show auditor:
   "Here's the verification detail.
    It's stored on ProofPass (encrypted).
    You can verify it anytime yourself."

5. Auditor's View:
   ✅ Verification is real
   ✅ Can't be faked (API protected)
   ✅ Data is secure (encrypted on ProofPass)
   ✅ You don't store raw data (compliant)
   ✅ Access is logged (audit trail)
```

---

## Data Retention & Auto-Deletion

### Timeline: Automatic Data Management

```
Day 0: Verification completed
├─ ProofPass stores encrypted data
├─ Neobank has access via API
└─ Data retention: 30 days

Day 1-30: Anytime Access
├─ Neobank can call API unlimited times
├─ Each access is logged
├─ Data stays encrypted
└─ User can revoke access anytime

Day 30: Auto-Expiration
├─ Data becomes inaccessible
├─ API returns: "Expired" error
├─ All files deleted from ProofPass
└─ Permanent cleanup

Day 31+: No Recovery
├─ Data is gone (GDPR compliant)
├─ Can't be recovered
├─ User has "right to be forgotten"
└─ Blockchain proof remains
```

### Customizable Retention

```typescript
// Neobank can choose retention period:

Option 1: "Standard" (default)
  Duration: 30 days
  Price: Included in plan

Option 2: "Extended"
  Duration: 90 days
  Price: +$0.10 per verification

Option 3: "Long-term Compliance"
  Duration: 7 years (regulatory requirement)
  Price: +$1.00 per verification
  Use case: Highly regulated industries

// API to set retention:
POST /api/verification-details?action=set-retention
{
  verificationId: "ver_789abc",
  retentionDays: 90  // Or 365, 2555, etc
}
```

---

## Security Features

### 1. **Read-Only Access**
```
What neobank CAN do:
✅ View verification details
✅ Check verification status
✅ See ID country and expiry
✅ See face confidence score

What neobank CANNOT do:
❌ Download raw ID photo
❌ Download face photo
❌ Get face biometric template
❌ Export full ID number
❌ Share with third parties
❌ Store locally
```

### 2. **Access Logging**
```
Every API call is logged:

{
  timestamp: "2026-05-20T15:30:00Z",
  verificationId: "ver_789abc",
  neobankName: "Flutterwave",
  neobankIP: "192.168.1.1",
  action: "VIEW_DETAILS",
  dataAccessed: ["idData.country", "matchScore"],
  status: "success"
}

Auditable by:
- ProofPass (security)
- Neobank (compliance)
- User (privacy check)
```

### 3. **Encryption at Rest**
```
Data on ProofPass Servers:
├─ Encrypted: AES-256
├─ Key: Unique per verification
├─ Backup: Replicated encrypted
├─ Access: Only via authenticated API
└─ No plaintext storage
```

### 4. **User Revocation**
```
User can revoke neobank access anytime:

User calls: POST /api/verification-details
{
  action: "revoke-access",
  verificationId: "ver_789abc"
}

Result:
├─ Neobank can no longer view
├─ API returns: "Access revoked"
├─ Data still deleted in 30 days
└─ User has full control
```

---

## Use Case: Neobank Integration Code

### NodeJS Example

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Your neobank's backend API
export async function getVerificationDetails(
  verificationId: string,
  neobankName: string
): Promise<VerificationDetails> {
  const response = await fetch(
    `https://proof-pass-verified-main.vercel.app/api/verification-details?id=${verificationId}&neobank=${neobankName}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.PROOFPASS_ADMIN_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 410) {
      throw new Error("Verification details have expired");
    }
    throw new Error(`Failed to get verification: ${response.statusText}`);
  }

  return response.json();
}

// Your support backend
export async function handleCustomerVerificationQuery(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const { verificationId } = req.query;
    const userId = req.user.id; // From auth

    // Get verification details from ProofPass
    const details = await getVerificationDetails(
      verificationId as string,
      "YourNeobank"
    );

    // Return to support agent (do NOT store)
    res.json({
      status: details.status,
      verifiedAt: details.verifiedAt,
      matchScore: details.matchScore,
      idCountry: details.idData.country,
      idExpiry: details.idData.expiryDate,
      livenessConfidence: details.faceData.livenessConfidence,
      message: `Customer verified with ${details.matchScore * 100}% confidence`,
    });

    // NOTE: This response is NOT saved in your database
    // It's just shown to support agent in real-time
    // User calls again → You query again → Fresh data from ProofPass
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Python Example

```python
import requests
from typing import Dict
import os

class ProofPassViewOnly:
    def __init__(self, admin_token: str):
        self.admin_token = admin_token
        self.base_url = "https://proof-pass-verified-main.vercel.app"

    def get_verification_details(self, verification_id: str, neobank_name: str = "YourNeobank") -> Dict:
        """
        Get verification details without storing them
        
        Can be called unlimited times within 30 days
        Data is read-only, encrypted, and auto-deleted after 30 days
        """
        headers = {
            "Authorization": f"Bearer {self.admin_token}"
        }
        
        response = requests.get(
            f"{self.base_url}/api/verification-details?id={verification_id}&neobank={neobank_name}",
            headers=headers
        )
        
        if response.status_code == 410:
            return {
                "error": "Verification details have expired and been deleted",
                "verificationId": verification_id,
            }
        
        if response.status_code != 200:
            raise Exception(f"Error: {response.status_code} - {response.text}")
        
        return response.json()

    def revoke_user_access(self, verification_id: str) -> Dict:
        """
        User revokes their verification details from this neobank
        """
        headers = {
            "Authorization": f"Bearer {self.admin_token}"
        }
        
        response = requests.post(
            f"{self.base_url}/api/verification-details?action=revoke-access",
            headers=headers,
            json={"verificationId": verification_id}
        )
        
        return response.json()


# Usage in your support system
client = ProofPassViewOnly(admin_token=os.getenv("PROOFPASS_TOKEN"))

# Customer asks: "Was I verified?"
verification_id = "ver_789abc"  # From your database

details = client.get_verification_details(verification_id)

print(f"✅ You were verified: {details['verifiedAt']}")
print(f"📊 Confidence: {details['matchScore'] * 100}%")
print(f"🌍 ID Country: {details['idData']['country']}")
print(f"📅 ID Expires: {details['idData']['expiryDate']}")

# Note: This data is NOT stored in your system
# It's only displayed and then forgotten
```

---

## Comparison: With vs Without View API

### Before (You Store Everything)
```
Customer Data Flow:
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Submit KYC
       ↓
┌──────────────────────┐
│ Your Server Stores:  │
│ ✓ ID photo           │
│ ✓ Selfie             │
│ ✓ Biometrics         │
│ ✓ Personal data      │
└────────┬─────────────┘
         │
         ├─→ Support needs to check: Query your DB ✓
         ├─→ Auditor asks to verify: Show them files ✓
         ├─→ Data breach: All photos leaked 💥
         ├─→ User requests deletion: You delete files ✓
         ├─→ GDPR audit: You have 500GB of user data 😱
         └─→ Compliance cost: $100K/year $$

Total stored data for 10,000 users: ~80GB
Compliance risk: HIGH
```

### After (ProofPass View Only)
```
Customer Data Flow:
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Submit KYC
       ↓
┌──────────────────────┐
│ ProofPass stores:    │
│ ✓ Encrypted data     │
│ ✓ Auto-deleted 30d   │
└────────┬─────────────┘
         │
         ├─→ Your DB stores: Verification ID ✓
         │
         ├─→ Support needs to check: Query ProofPass API ✓
         ├─→ Auditor asks to verify: Show them ProofPass data ✓
         ├─→ Data breach: No photos stored by you 🔒
         ├─→ User requests deletion: ProofPass deletes in 30d ✓
         ├─→ GDPR audit: You only store reference IDs 📝
         └─→ Compliance cost: Built-in to ProofPass $

Total stored data for 10,000 users: ~1MB (just IDs)
Compliance risk: LOW
```

---

## Access Control Matrix

| Who | Can | Action | Sees |
|-----|-----|--------|------|
| **User (Customer)** | ✅ | Request own verification data | Full details (GDPR) |
| **User (Customer)** | ✅ | Revoke neobank access | Neobank blocked from viewing |
| **Neobank (Support)** | ✅ | View verification anytime | Status, ID expiry, confidence |
| **Neobank (Support)** | ❌ | Download ID photo | Access denied |
| **Neobank (Support)** | ❌ | Export face template | Access denied |
| **Neobank (Admin)** | ✅ | Configure retention period | Settings |
| **Neobank (Admin)** | ✅ | View access logs | Who viewed when |
| **Neobank (Admin)** | ❌ | Delete user verification | Not allowed (immutable) |
| **Auditor** | ✅ | Query API with neobank | Verification proof |
| **ProofPass** | ✅ | Monitor access logs | Security audit |
| **Hacker** | ❌ | Access without auth | Blocked (requires token) |

---

## Compliance Benefits

### GDPR
```
✅ Data minimization: Only verification ID stored locally
✅ Right to be forgotten: Auto-deleted in 30 days
✅ User control: Can revoke access anytime
✅ Access logging: Transparent audit trail
✅ Purpose limitation: Data only for verification
```

### Banking Regulations (Nigeria)
```
✅ Audit trail: Every access logged
✅ Data security: Encrypted at rest and in transit
✅ Compliance: Meets EFCC requirements
✅ Documentation: Blockchain immutable proof
✅ Privacy: Minimal data retention
```

### SOC 2 Compliance
```
✅ Access controls: Only authenticated neobanks
✅ Encryption: AES-256 at rest
✅ Logging: Complete audit trail
✅ Retention: Auto-delete policy
✅ Disaster recovery: Replicated backup
```

---

## Getting Started

### 1. Check Your Admin Dashboard
```
Go to: https://proof-pass-verified-main.vercel.app/admin
Scroll to: Verification Details tab
Click: View API Documentation
```

### 2. Get Verification ID
```
When you verify a user, you receive:
{
  verificationId: "ver_789abc",  ← Store this
  nftTokenId: "nft_123456",
  status: "verified"
}
```

### 3. Call API Anytime
```typescript
// Any time later (within 30 days):
GET /api/verification-details?id=ver_789abc
Headers: Authorization: Bearer sk_YOUR_KEY

// Returns details: status, ID country, confidence, etc
// Does NOT download: photos, biometrics, full ID number
```

### 4. No Storage Needed
```
// Just use the response, don't save it
const details = await getVerificationDetails(verificationId);

// Show to support agent:
console.log(`Verified: ${details.status}`);

// Then forget it:
// (response not stored in database)
```

---

## FAQ

**Q: Can my neobank download the ID photo using this API?**
A: No. The API returns only metadata (country, expiry date). Raw photos are never exposed.

**Q: Can we store the verification details in our database?**
A: Technically yes, but it defeats the purpose. Better to query on-demand and discard.

**Q: What if a support agent needs to verify the same customer twice?**
A: Query the API both times. You'll get fresh data from ProofPass (encrypted, secure).

**Q: Can we share verification details with third parties?**
A: No. API returns read-only data that can't be exported or shared.

**Q: What happens after 30 days?**
A: API returns 410 status. Data is permanently deleted. User must re-verify if needed.

**Q: Can we customize the 30-day retention?**
A: Yes. You can set 90 days, 7 years, or custom period. Different pricing tiers available.

**Q: Is this API included in standard plan?**
A: Yes. Included in all tiers. Extended retention (+90 days) has optional fee.

**Q: Can auditors access this data?**
A: Yes. With neobank credentials, they can view verification proof. Immutable on blockchain.

---

## Summary

✅ **Neobanks can ACCESS data anytime** (via API)
✅ **Neobanks do NOT STORE data** (stay on ProofPass)
✅ **Access is READ-ONLY** (can't download/copy)
✅ **Data auto-expires** (30 days, GDPR compliant)
✅ **Every access is logged** (audit trail)
✅ **Users can revoke** (privacy control)
✅ **Blockchain proof remains** (immutable)

**Best of both worlds:**
- Neobank can confirm verification anytime
- Neobank doesn't store sensitive data
- Regulatory compliance automatic
- Customer privacy protected

