# ProofPass API Integration Guide

## Quick Start

### **1. Save User Verification (After KYC Completion)**

```javascript
// Step 1: Collect user verification data
const userData = {
  id: `user_${Date.now()}`,                    // Unique ID
  email: userEmail,                             // From form input
  accountType: "personal",                      // personal | business
  status: "Complete",                           // Verification status
  tier: "Tier 2 — Full",                        // KYC tier level
  region: "Nigeria (NG)",                       // User's country
  verifiedAt: new Date().toISOString(),        // When verified
  expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString(), // Expiry
  token: `Token #${Math.floor(Math.random()*100000)}`, // NFT token
  walletAddress: generateWalletAddress(),      // Blockchain address
  dataMetrics: {
    timesViewed: 0,
    timesShared: 0,
    timesVerified: 1
  }
};

// Step 2: Save to ProofPass API
try {
  const response = await fetch("https://proof-pass-verified-main.vercel.app/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  
  if (response.ok) {
    const saved = await response.json();
    console.log("✅ User verified and saved:", saved);
    localStorage.setItem("userId", userData.id);
    // Redirect to dashboard
    window.location.href = "/dashboard";
  } else {
    console.error("❌ API error:", await response.json());
  }
} catch (error) {
  console.error("❌ Network error:", error);
}
```

---

### **2. Retrieve User Verification Status (For Dashboard)**

```javascript
// Get the stored user ID
const userId = localStorage.getItem("userId");

if (userId) {
  try {
    const response = await fetch(
      `https://proof-pass-verified-main.vercel.app/api/users?id=${userId}`
    );
    
    if (response.ok) {
      const user = await response.json();
      console.log("✅ User data retrieved:", user);
      
      // Display on dashboard
      displayVerificationStatus(user);
    } else {
      console.error("❌ User not found");
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}

function displayVerificationStatus(user) {
  document.getElementById("status").textContent = user.status;
  document.getElementById("tier").textContent = user.tier;
  document.getElementById("token").textContent = user.token;
  document.getElementById("expires").textContent = user.expiresAt;
}
```

---

### **3. React Hook for Easy Integration**

```javascript
import { useState, useEffect } from "react";

function useProofPassUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://proof-pass-verified-main.vercel.app/api/users?id=${userId}`
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}

// Usage in component
export function Dashboard() {
  const { user, loading, error } = useProofPassUser();

  if (loading) return <div>Loading verification status...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No verification data found</div>;

  return (
    <div>
      <h2>Verification Status: {user.status}</h2>
      <p>Tier: {user.tier}</p>
      <p>Token: {user.token}</p>
      <p>Wallet: {user.walletAddress}</p>
      <p>Expires: {new Date(user.expiresAt).toLocaleDateString()}</p>
    </div>
  );
}
```

---

### **4. Backend/Node.js Integration**

```javascript
const axios = require("axios");

const API_BASE = "https://proof-pass-verified-main.vercel.app/api";

// Save user verification
async function saveUserVerification(userData) {
  try {
    const response = await axios.post(`${API_BASE}/users`, userData, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
}

// Get user by ID
async function getUserVerification(userId) {
  try {
    const response = await axios.get(`${API_BASE}/users`, {
      params: { id: userId }
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
}

// Get all users
async function getAllUsers() {
  try {
    const response = await axios.get(`${API_BASE}/users`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
}

// Example usage
(async () => {
  // Save a verification
  const newUser = await saveUserVerification({
    id: `user_${Date.now()}`,
    email: "john@example.com",
    status: "Complete",
    tier: "Tier 2 — Full",
    region: "Nigeria (NG)",
    verifiedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
    token: `Token #${Math.random() * 100000}`,
    walletAddress: "0x1234567890abcdef",
    dataMetrics: { timesViewed: 0, timesShared: 0, timesVerified: 1 }
  });
  console.log("Saved:", newUser);

  // Retrieve verification
  const user = await getUserVerification(newUser.id);
  console.log("Retrieved:", user);
})();
```

---

### **5. Error Handling Best Practices**

```javascript
async function callProofPassAPI(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      headers: { "Content-Type": "application/json" },
      ...options
    });

    // Handle different status codes
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(`Invalid request: ${error.error}`);
    }
    
    if (response.status === 404) {
      throw new Error("User not found");
    }
    
    if (response.status === 500) {
      throw new Error("Server error. Please try again later.");
    }

    if (response.status === 405) {
      throw new Error("Method not allowed");
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("ProofPass API Error:", error.message);
    
    // Re-throw or handle gracefully
    throw error;
  }
}
```

---

## API Response Formats

### **Success Response (201/200)**
```json
{
  "id": "user_1716234567890",
  "email": "john@example.com",
  "accountType": "personal",
  "status": "Complete",
  "tier": "Tier 2 — Full",
  "region": "Nigeria (NG)",
  "verifiedAt": "2026-05-20T14:25:07.000Z",
  "expiresAt": "2027-05-20T14:25:07.000Z",
  "token": "Token #12345",
  "walletAddress": "0x1234567890abcdef",
  "dataMetrics": {
    "timesViewed": 0,
    "timesShared": 0,
    "timesVerified": 1
  }
}
```

### **Error Response (400/500)**
```json
{
  "error": "Invalid request body"
}
```

### **Not Found Response (200)**
```json
{
  "error": "Not found"
}
```

---

## Common Integration Scenarios

### **Scenario 1: Neobank Integration**
```javascript
// After user completes KYC on neobank
const kycData = {
  id: generateUniqueId(),
  email: user.email,
  status: "Complete",
  tier: "Tier 2 — Full",
  region: user.country,
  verifiedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
  token: generateNFTToken(),
  walletAddress: user.walletAddress,
  dataMetrics: { timesViewed: 0, timesShared: 0, timesVerified: 1 }
};

// Save to ProofPass
await fetch("https://proof-pass-verified-main.vercel.app/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(kycData)
});

// User now has portable KYC for other integrations
```

### **Scenario 2: Cross-Neobank Verification Check**
```javascript
// Bank B wants to verify if user is already verified with ProofPass
async function checkProofPassStatus(userId) {
  const response = await fetch(
    `https://proof-pass-verified-main.vercel.app/api/users?id=${userId}`
  );
  
  if (response.ok) {
    const user = await response.json();
    if (user.status === "Complete" && new Date(user.expiresAt) > new Date()) {
      // User is verified and not expired
      return { verified: true, tier: user.tier, token: user.token };
    }
  }
  
  return { verified: false };
}
```

### **Scenario 3: Analytics Dashboard**
```javascript
// Admin dashboard to see all verifications
async function getAllVerifications() {
  const response = await fetch("https://proof-pass-verified-main.vercel.app/api/users");
  const users = await response.json();
  
  const stats = {
    totalVerified: users.length,
    tier2Count: users.filter(u => u.tier === "Tier 2 — Full").length,
    expiringsoon: users.filter(u => {
      const daysLeft = (new Date(u.expiresAt) - new Date()) / (24*60*60*1000);
      return daysLeft < 30;
    }).length
  };
  
  return stats;
}
```

---

## Testing the API

### **Using Postman**
1. Create POST request to: `https://proof-pass-verified-main.vercel.app/api/users`
2. Body (raw JSON):
```json
{
  "id": "test_user_123",
  "email": "test@example.com",
  "status": "Complete",
  "tier": "Tier 2 — Full",
  "region": "Nigeria (NG)",
  "verifiedAt": "2026-05-20T14:25:07Z",
  "expiresAt": "2027-05-20T14:25:07Z",
  "token": "Token #12345",
  "walletAddress": "0x1234567890abcdef",
  "dataMetrics": {"timesViewed": 0, "timesShared": 0, "timesVerified": 1}
}
```
3. Send and check 201 response

### **Using Thunder Client (VS Code)**
Same as Postman - create request with same JSON body

### **Quick Test with Browser Console**
```javascript
fetch("https://proof-pass-verified-main.vercel.app/api/users", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    id: "test_" + Date.now(),
    email: "test@example.com",
    status: "Complete",
    tier: "Tier 2 — Full",
    region: "Nigeria (NG)",
    verifiedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
    token: "Token #123",
    walletAddress: "0xabcd1234",
    dataMetrics: {timesViewed: 0, timesShared: 0, timesVerified: 1}
  })
}).then(r => r.json()).then(console.log);
```

---

## Deployment Notes

- **Endpoint:** https://proof-pass-verified-main.vercel.app/api/users
- **CORS:** Enabled for all origins
- **Rate Limit:** None (add if needed for production)
- **Timeout:** 60 seconds (Vercel default)
- **Storage:** In-memory + JSON file (survives cold starts)
- **Uptime:** 99.99% (Vercel SLA)
