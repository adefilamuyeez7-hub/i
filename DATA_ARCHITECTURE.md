# ProofPass Data Architecture - Verify Without Storage

## The Core Value Proposition

**Traditional way:** You store everything → Risk
**ProofPass way:** We verify, you store nothing sensitive → Safe

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR NEOBANK                                │
│                                                                     │
│  User KYC Form:                                                    │
│  ┌──────────────────────┐                                         │
│  │ Name: John Doe       │                                         │
│  │ ID Photo: [upload]   │                                         │
│  │ Selfie: [upload]     │                                         │
│  │ Country: Nigeria     │                                         │
│  └──────────────────────┘                                         │
│           │                                                        │
│           │ POST /api/users                                       │
│           │ + API Key: sk_YOUR_KEY                               │
│           ↓                                                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (Encrypted)
                              │
                    ┌─────────↓──────────┐
                    │ PROOFPASS SERVER   │
                    │ (Vercel Functions) │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ↓                     ↓                     ↓
    ┌────────────┐    ┌────────────┐    ┌──────────────────┐
    │  FACE      │    │ DOCUMENT   │    │  LIVENESS        │
    │  DETECTION │    │ VALIDATION │    │  CHECK           │
    │            │    │            │    │                  │
    │ Runs ML    │    │ Scans ID   │    │ Prevents:        │
    │ model to:  │    │ authenticity│    │ • Spoofed photos │
    │ • Extract  │    │ • Checks   │    │ • Deep fakes     │
    │   face     │    │   holograms│    │ • Printed photos │
    │ • Measure  │    │ • Validates│    │                  │
    │   features │    │   RFID/MRZ │    │ Uses:            │
    │ • Create   │    │            │    │ • Head movement  │
    │   template │    │ Database:  │    │ • Eye tracking   │
    │            │    │ Known fakes│    │ • Texture analysis
    └────────────┘    └────────────┘    └──────────────────┘
        │                   │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ↓
                    ┌──────────────────────┐
                    │  FACE-ID MATCHING    │
                    │                      │
                    │ Compare:             │
                    │ • Face template      │
                    │ • ID photo template  │
                    │                      │
                    │ Confidence: 98%+ ✅  │
                    └──────────────────────┘
                              │
                    Does everything match?
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ✅ YES                 ❌ NO
                    │                   │
                    ↓                   ↓
            ┌───────────────┐   ┌────────────────┐
            │  MINT NFT ON  │   │ MARK FAILED    │
            │  POLYGON      │   │                │
            │               │   │ Return:        │
            │ Transaction:  │   │ {              │
            │ 0x123abc...   │   │   status:      │
            │               │   │   "failed"     │
            │ Token ID:     │   │ }              │
            │ nft_123456    │   │                │
            └───────┬───────┘   └────────────────┘
                    │
                    ↓
        ┌──────────────────────────┐
        │  DELETE ALL FILES FROM   │
        │  PROOFPASS SERVERS:      │
        │                          │
        │ ❌ ID photo - DELETED    │
        │ ❌ Selfie - DELETED      │
        │ ❌ Face template - DELETED
        │ ❌ All working files     │
        │ ❌ Temporary data        │
        │                          │
        │ ✅ Kept: Only           │
        │   • Verification ID     │
        │   • NFT Token ID        │
        │   • Blockchain proof    │
        └──────────────────────────┘
                    │
                    ↓
        ┌──────────────────────────┐
        │  RETURN TO YOUR NEOBANK  │
        │                          │
        │ {                        │
        │   status: "verified",    │
        │   verificationId:        │
        │   "ver_789abc",          │
        │   nftTokenId:            │
        │   "nft_123456",          │
        │   blockchain: {          │
        │     txHash: "0x123...",  │
        │     network: "Polygon",  │
        │     chainId: 137         │
        │   }                      │
        │ }                        │
        └──────────────────────────┘
                    │
                    │
                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     YOUR NEOBANK DATABASE                           │
│                                                                     │
│  STORE (what you need):                                            │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ {                                                          │   │
│  │   userId: "user_123",                                      │   │
│  │   name: "John Doe",              ← You collected           │   │
│  │   email: "john@example.com",     ← You collected           │   │
│  │   phone: "+234-701-XXX-XXXX",    ← You collected           │   │
│  │   country: "Nigeria",            ← You collected           │   │
│  │   verificationStatus: "verified",← You got from ProofPass  │   │
│  │   verificationId: "ver_789abc",  ← Reference to proof      │   │
│  │   nftTokenId: "nft_123456",      ← Blockchain proof       │   │
│  │   verifiedAt: "2026-05-20T14:59",← Timestamp              │   │
│  │   accountStatus: "active"        ← Your business logic    │   │
│  │ }                                                          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  DON'T STORE (ProofPass already deleted these):                    │
│  ❌ ID Photo                                                       │
│  ❌ Selfie/Face Photo                                              │
│  ❌ Biometric Features                                             │
│  ❌ Document Scans                                                 │
│  ❌ Raw Identity Data                                              │
│  ❌ Verification Details                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                    │
                    │
                    ↓
        ┌──────────────────────────┐
        │  BLOCKCHAIN PROOF        │
        │  (Polygon Network)       │
        │                          │
        │ Immutable Record:        │
        │ • Verification ID        │
        │ • User ID               │
        │ • Timestamp             │
        │ • NFT Token             │
        │ • Transaction Hash      │
        │ • Status: PASSED        │
        │                          │
        │ Regulators can verify:  │
        │ polygonscan.com/tx/...  │
        │                          │
        │ Cannot be:              │
        │ ❌ Deleted              │
        │ ❌ Modified             │
        │ ❌ Faked                │
        └──────────────────────────┘
```

---

## Data Lifecycle Timeline

### T=0: User Submits KYC
```
ProofPass Servers Receive:
├─ ID Photo: 5 MB JPG
├─ Selfie: 3 MB JPG
├─ Name: "John Doe"
├─ Country: "Nigeria"
└─ Metadata: IP, timestamp, etc

Your Storage:
├─ Name: "John Doe" (encrypted)
├─ Email: "john@example.com" (encrypted)
└─ Phone: "+234-XXX-XXXX" (encrypted)

Status: Processing...
```

### T=5-30 seconds: Verification in Progress
```
ProofPass Memory (RAM):
├─ ID Photo: Processing
├─ Selfie: Face extraction running
├─ ML Models: Running 3 verification checks
└─ Temporary: Face template in memory

Your Storage:
└─ Same as T=0 (no changes)

Status: Verifying...
```

### T=30 seconds: Verification Complete
```
Verification Result:
├─ Face Liveness: ✅ PASSED (99% confidence)
├─ ID Authenticity: ✅ PASSED (genuine ID)
├─ Face-ID Match: ✅ PASSED (98% match)
└─ Status: VERIFIED

Actions:
1. Mint NFT on Polygon blockchain
2. Record immutable proof
3. Generate verification ID
4. ProofPass signals: "Delete all user data"

Your Storage:
├─ Name: "John Doe"
├─ Email: "john@example.com"
├─ Phone: "+234-XXX-XXXX"
├─ verificationId: "ver_789abc"      ← NEW
├─ nftTokenId: "nft_123456"          ← NEW
├─ verificationStatus: "verified"    ← NEW
└─ verifiedAt: "2026-05-20T14:59"    ← NEW

Status: Ready to return result
```

### T=31 seconds: Data Cleanup
```
ProofPass Cleanup Process:
├─ ID Photo: PERMANENTLY DELETED
├─ Selfie: PERMANENTLY DELETED
├─ Face Template: PERMANENTLY DELETED
├─ ML Model Outputs: DELETED
├─ Temporary Files: DELETED
└─ Logs: Sanitized (no PII)

Your Storage:
└─ Same as T=30 (verification complete)

ProofPass Storage (Permanent):
├─ Verification ID: "ver_789abc"
├─ Status: "verified"
├─ Timestamp: "2026-05-20T14:59:00Z"
└─ Blockchain TX: "0x123abc..."

Status: Cleanup complete
```

### T=32 seconds Onwards: Permanent State
```
ProofPass Storage (Forever):
├─ User photos: GONE ✓
├─ User data: GONE ✓
├─ Verification ID: KEPT (reference)
└─ Blockchain proof: IMMUTABLE

Your Storage (Forever):
├─ User profile: KEPT (your responsibility)
├─ Verification status: KEPT (your responsibility)
├─ Verification ID: KEPT (audit trail)
└─ NFT Token ID: KEPT (proof)

Blockchain (Forever):
├─ Verification record: IMMUTABLE
├─ User ID: IMMUTABLE
├─ Timestamp: IMMUTABLE
├─ NFT Token: IMMUTABLE
└─ Cannot be altered or deleted

Status: Complete
```

---

## Security at Each Stage

### Stage 1: Data in Transit
```
User Phone → ProofPass Servers
├─ HTTPS encryption (TLS 1.3)
├─ End-to-end encrypted payload
├─ Certificate pinning enabled
├─ No intermediate storage
└─ Expires in 30 days
```

### Stage 2: Data Processing
```
ProofPass Processing:
├─ Runs in isolated Vercel Function
├─ No persistent storage during processing
├─ Memory-only operations
├─ No logging of raw data
├─ Automatic memory cleanup
└─ 128-bit AES encryption for temp files
```

### Stage 3: Data Deletion
```
After verification:
├─ Secure deletion (overwrites 7 times)
├─ Files marked as "unrecoverable"
├─ Database records deleted
├─ Backup systems purged
├─ Audit log sanitized
└─ Verification: Deletion confirmed in logs
```

### Stage 4: Proof Storage
```
Blockchain (Immutable):
├─ Public ledger (Polygon)
├─ Cannot be deleted
├─ Cannot be modified
├─ Audit trail permanent
├─ Transaction hash as proof
└─ Verifiable by regulators
```

---

## Why ProofPass Deletes Data (Immediately)

### 1. Security
```
If ProofPass keeps user photos:
- Another breach = your customers' photos leaked
- Your liability? Shared
- Regulatory fines? Doubled

ProofPass deletes photos:
- Nothing to steal after verification
- Your customers' data safe
- No liability for ProofPass storage
- Regulatory requirement met
```

### 2. Cost
```
ProofPass keeps photos:
- Massive storage costs
- Liability insurance: expensive
- Compliance team: large
- Backup infrastructure: expensive

ProofPass deletes photos:
- Minimal storage (only metadata)
- Lower costs = lower pricing for you
- Simpler operations
- Passes savings to customers
```

### 3. Privacy
```
User perspective - Traditional KYC:
"My ID photo is on your servers for 7 years?"
- Worry about data breaches
- Worry about internal misuse
- Worry about government access
- No control

User perspective - ProofPass:
"You delete my photo immediately?"
- Photo deleted in 30 seconds
- Nothing to breach or misuse
- Privacy preserved
- User control: Full

This = Better UX for your customers
```

### 4. Regulatory Compliance
```
GDPR:
- User can request deletion
- Data minimization principle
- Right to be forgotten

ProofPass approach:
- Data deleted automatically
- Minimal storage by design
- GDPR automatically satisfied
- No user deletion requests needed
```

---

## Real Audit Scenario

**Scenario: Nigerian Central Bank Auditing Your KYC**

### Day 1: Audit Notice
```
You receive: Audit of 100 random users from March 2026

Your Response:
- Pull 100 records from your database
- Include verification IDs and NFT tokens
```

### Day 2: CBN Audit Process
```
CBN Inspector checks:
1. "Show me verification for user John Doe"

Your Answer:
   User DB record:
   {
     name: "John Doe",
     verificationId: "ver_789abc",
     nftTokenId: "nft_123456",
     verifiedAt: "2026-05-20T14:59"
   }

2. "Where's his ID scan and photo?"

Your Answer:
   "ProofPass deleted them after verification
    as per GDPR and privacy requirements"

3. "How do I verify the verification was real?"

Your Answer:
   "Check blockchain proof:
    https://polygonscan.com/tx/0x123abc...
    
    This immutable record shows:
    - Date verified: 2026-05-20 14:59
    - User ID: john_doe_001
    - Verification passed
    - Cannot be faked or deleted"

4. CBN verifies on blockchain → ✅ CONFIRMED

Result: ✅ Audit passed
```

---

## Comparison: Traditional vs ProofPass

| Aspect | Traditional KYC | ProofPass |
|--------|---|---|
| **Data Stored** | All photos, docs, biometrics | Only verification result |
| **Storage Duration** | 7-10 years | Deleted in 30 seconds |
| **Breach Risk** | High (lots of data) | Minimal (no data) |
| **GDPR Risk** | High (user data retention) | Minimal (auto-delete) |
| **Audit Trail** | Database logs only | Immutable blockchain |
| **Proof of Verification** | Can be questioned | Cannot be faked |
| **Cost per User** | $6-10/year | $1-2/year |
| **User Trust** | Lower | Higher |
| **Regulatory Approval** | Questioned | Preferred |

---

## Questions Your Auditors Will Ask

**Q1: "Where are the ID scans?"**
A: "Deleted by ProofPass after verification to comply with data minimization principles"

**Q2: "How do I know the verification is real?"**
A: "Check the blockchain. Immutable proof at polygonscan.com/tx/..."

**Q3: "Can the user fake verification?"**
A: "No. Blockchain proof cannot be altered. System checked face liveness, ID authenticity, and face-ID match before minting"

**Q4: "What if ProofPass loses the verification record?"**
A: "Blockchain has permanent record. Even if ProofPass disappears, proof remains on Polygon forever"

**Q5: "Is this compliant with Nigerian banking rules?"**
A: "Yes. Uses GDPR-compliant data handling. Immutable audit trail exceeds requirements"

---

## Your Competitive Advantage

As a neobank using ProofPass:

1. **Trust:** "We delete your sensitive data immediately"
2. **Speed:** "5-30 second verification, not 48 hours"
3. **Cost:** "$1.19 per user vs $6.10 with traditional"
4. **Compliance:** "Blockchain proof for auditors"
5. **Scale:** "Handle 100K+ verifications without storage bloat"

---

## Next Steps

1. ✅ Understand the architecture (you just did)
2. ✅ Review NEOBANK_QUICK_START.md
3. ✅ Read NEOBANK_INTEGRATION.md for code examples
4. ✅ Get your API key from admin dashboard
5. ✅ Integrate into your backend
6. ✅ Test with sample user
7. ✅ Launch production
8. ✅ Monitor your dashboard

---

## Questions?

- **Email:** support@proofpass.io
- **Admin Dashboard:** https://proof-pass-verified-main.vercel.app/admin
- **GitHub Issues:** https://github.com/proof-pass/sdk/issues
