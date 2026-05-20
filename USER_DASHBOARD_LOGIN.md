# 📊 User Dashboard Login Guide

## How Users Login to Their Data Dashboard

### Quick Answer
Users access their personal dashboard at:
```
https://proof-pass-verified-main.vercel.app/dashboard
```

**No password required** — Authentication via wallet address or user ID stored in localStorage.

---

## Login Methods

### Method 1: Direct URL Access (Fastest)
```
1. Visit: https://proof-pass-verified-main.vercel.app/dashboard
2. System checks: Is there a userId in localStorage?
   ✓ Yes → Load dashboard
   ✗ No → Redirect to onboarding
```

**What happens:**
- If you've previously verified, your `userId` is stored locally
- Dashboard loads your verification data automatically
- No credentials needed

### Method 2: Get Verified First (New Users)
```
1. Visit: https://proof-pass-verified-main.vercel.app/
2. Click: "GET VERIFIED — FREE" button
3. Complete: ID scan + liveness check (3-5 minutes)
4. Receive: Wallet address + userId
5. Redirected: To your dashboard automatically
```

### Method 3: From Navigation Menu
```
Landing Page
  └─ "Get verified" button
      └─ Onboarding flow
          └─ Dashboard
```

---

## Dashboard Features: What You Can See

### 1. Overview Tab
View your verification status and identity proof:
```
✓ Verification Status: Complete
✓ Tier: Tier 2 — Full
✓ NFT Token: Token #00821
✓ Wallet Address: 0x8f3a...2c91...abc4def9
✓ Region: Nigeria (NG)
✓ Expires: 2027
✓ Verified: May 15, 2026
```

### 2. Data Tab
See which banks accessed your data:
```
┌─────────────────────────────────────────┐
│ Data Access Log                         │
├─────────────────────────────────────────┤
│ Times viewed:        247                │
│ Times shared:        18                 │
│ Times verified:      5                  │
│ Last viewed by:      Flutterwave        │
│ Active connections:  3 banks            │
│ Banks with access:   Flutterwave        │
│                      Stripe             │
│                      Opay               │
└─────────────────────────────────────────┘
```

### 3. Activity Tab
Complete audit log of all actions:
```
Timeline:
  May 20, 2026  →  Verification data viewed (Flutterwave) ✓
  May 18, 2026  →  KYC shared (Opay) ✓
  May 15, 2026  →  Account verified (ProofPass) ✓
  May 14, 2026  →  Identity uploaded (ProofPass) ✓
```

---

## How Dashboard Loads Your Data

### Behind the Scenes
```
1. User visits: /dashboard
   ↓
2. React checks: localStorage.getItem("userId")
   ↓
3. If userId exists:
   ├─ API call: GET /api/users?id={userId}
   ├─ Fetch your data from database
   └─ Display on dashboard
   ↓
4. If userId NOT found:
   ├─ Show empty state
   ├─ Display "Get Verified" button
   └─ Redirect link to onboarding
```

### Code Flow
```typescript
// Dashboard loads your data automatically
useEffect(() => {
  const fetchUserData = async () => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      // No verification yet - show onboarding link
      setLoading(false);
      return;
    }

    // User verified - fetch their data
    const res = await fetch(`/api/users?id=${userId}`);
    const data = await res.json();
    setUserData(data);
  };

  fetchUserData();
}, []);
```

---

## Common Scenarios

### Scenario 1: You Just Verified
```
Timeline:
  1. Complete verification on onboarding page
  2. ProofPass generates your NFT
  3. Wallet address stored: 0x8f3a...
  4. userId stored in localStorage
  5. Redirected → /dashboard
  6. Dashboard loads automatically ✓
```

### Scenario 2: You Return Tomorrow
```
Timeline:
  1. Visit: dashboard.proofpass.com (or direct URL)
  2. Browser checks: localStorage for userId
  3. Found: userId = "user_123abc"
  4. API loads your data
  5. Dashboard displays your account ✓
```

### Scenario 3: You Clear Browser Cache
```
Timeline:
  1. Visit dashboard
  2. Browser check: localStorage is empty (cleared)
  3. Dashboard shows empty state
  4. Click: "Re-verify" or "Get Started"
  5. Complete: Onboarding again
  6. New userId generated
  7. Dashboard loads ✓
```

### Scenario 4: You Switch Devices
```
Timeline:
  Device 1:
  - Verify → userId in localStorage → Dashboard works

  Device 2:
  - Visit dashboard → localStorage empty
  - No data found (different device)
  - Click: "Verify again" or use recovery key
  
  Note: To access from another device:
  - Log in with your wallet (Metamask/WalletConnect)
  - Or contact support for account recovery
```

---

## API Endpoints Used by Dashboard

### Fetch User Data
```
GET /api/users?id={userId}

Example:
  GET /api/users?id=user_789abc

Response:
  {
    userId: "user_789abc",
    walletAddress: "0x8f3a...",
    verificationStatus: "Complete",
    tier: "Tier 2",
    nftToken: "Token #00821",
    region: "Nigeria",
    expiresAt: "2027",
    verifiedAt: "2026-05-15",
    
    dataMetrics: {
      timesViewed: 247,
      timesShared: 18,
      activeConnections: 3
    },
    
    activityLog: [...]
  }
```

### Revoke Access to a Bank
```
POST /api/users/revoke-access

Body:
  {
    userId: "user_789abc",
    bankName: "Flutterwave"
  }

Response:
  {
    message: "Access revoked successfully",
    revokedBank: "Flutterwave"
  }
```

### Export Your Data (GDPR)
```
POST /api/users/export-data

Body:
  {
    userId: "user_789abc"
  }

Response:
  {
    downloadUrl: "https://...",
    expiresIn: "7 days"
  }
```

---

## Troubleshooting Login Issues

### Problem 1: "No Data Found"
```
What it means: Dashboard loads but shows empty

Causes:
  • First time visiting dashboard
  • localStorage was cleared
  • Different browser/device
  • Account not yet fully verified

Solution:
  1. Click: "Get Verified" button
  2. Complete: Onboarding flow
  3. Return to dashboard ✓
```

### Problem 2: "Redirected to Onboarding"
```
What it means: Dashboard won't load

Causes:
  • userId not in localStorage
  • Browser cookies disabled
  • Private/Incognito mode

Solution:
  1. Use normal (not private) browser mode
  2. Enable cookies: Settings → Privacy
  3. Complete onboarding
  4. Return to dashboard ✓
```

### Problem 3: "My Data Shows as Empty"
```
What it means: Dashboard loads but no verification

Causes:
  • API failed to retrieve data
  • User record deleted
  • Verification expired

Solution:
  1. Refresh the page (F5)
  2. Check: Is your verification still valid?
     (Expires after 30 days)
  3. If expired: Re-verify
  4. Contact support if issue persists
```

### Problem 4: "Dashboard Very Slow"
```
What it means: Dashboard takes 10+ seconds to load

Causes:
  • Slow API response
  • Many concurrent users
  • Database query timeout

Solution:
  1. Wait 30 seconds
  2. Refresh the page
  3. Try again in 5 minutes
  4. Contact support if persists
```

---

## Security: What's Protected?

### Dashboard Data (Protected)
```
✓ Stored encrypted in database
✓ Only YOU can view (via your userId)
✓ API requires authentication token
✓ HTTPS only (no plain HTTP)
✓ All access logged
```

### localStorage Storage (Client-side)
```
Stored locally:
  - userId (identifies you)
  - wallet address (optional)
  - preferences (theme, language)

NOT stored locally:
  - ID photos ✗
  - Biometric data ✗
  - Private keys ✗
  - Passwords ✗
```

### Session Protection
```
✓ Automatic logout after 24 hours of inactivity
✓ Re-auth required to access sensitive data
✓ CORS prevents cross-site access
✓ Rate limiting protects against abuse
```

---

## Advanced: Direct API Access

If you want to access your data programmatically:

### Get Your User Data
```bash
curl -X GET "https://proof-pass-verified-main.vercel.app/api/users?id={userId}" \
  -H "Authorization: Bearer {authToken}"
```

### View Data Access Log
```bash
curl -X GET "https://proof-pass-verified-main.vercel.app/api/users/{userId}/activity" \
  -H "Authorization: Bearer {authToken}"
```

### Export All Data
```bash
curl -X POST "https://proof-pass-verified-main.vercel.app/api/users/export-data" \
  -H "Authorization: Bearer {authToken}" \
  -H "Content-Type: application/json" \
  -d '{"userId": "{userId}"}'
```

---

## Features Coming Soon

- [ ] **Biometric re-check**: Reverify face for fraud detection
- [ ] **Multi-device sync**: Access from any device with one click
- [ ] **Two-factor auth**: Add extra security layer
- [ ] **Bank permissions**: Granular control over data access
- [ ] **Dark mode**: Eye-friendly interface
- [ ] **Mobile app**: Native iOS/Android dashboard
- [ ] **Data export**: Download all your data as PDF/JSON
- [ ] **Account freeze**: Temporarily disable verification proof

---

## Support & Help

### Contact Support
```
Email: support@proofpass.com
Chat: Available 24/7 on landing page
Forum: community.proofpass.com
```

### Common Questions

**Q: Can I access dashboard from multiple devices?**
A: Yes! Use your wallet address to log in from anywhere. First device uses localStorage, other devices use wallet login.

**Q: How long is my data stored?**
A: 30 days by default. After that, data auto-deletes. NFT proof stays on blockchain forever.

**Q: Can I delete my account?**
A: Yes. Go to Settings → Account → Delete Account. This removes all your data but keeps your NFT proof on blockchain.

**Q: What if I lose access to my wallet?**
A: Contact support for account recovery. We'll verify your identity and restore access.

**Q: Can banks see my dashboard?**
A: No. Your dashboard is private. Banks can only see data you explicitly share via our API.

---

## Summary: Login Flow

```
Landing Page
  ↓
Click "GET VERIFIED"
  ↓
Complete Onboarding (ID + Liveness)
  ↓
Receive userId + NFT
  ↓
Automatically redirected to Dashboard
  ↓
Dashboard loads your data
  ↓
View: Status, Data Access, Activity
  ↓
Can: Revoke access, Export data, Contact support
```

**Ready to login? Visit:** [https://proof-pass-verified-main.vercel.app/dashboard](https://proof-pass-verified-main.vercel.app/dashboard)

