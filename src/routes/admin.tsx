import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, Trash2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [adminToken, setAdminToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyNeobank, setNewKeyNeobank] = useState("");
  const [generatedKey, setGeneratedKey] = useState<any>(null);
  const [error, setError] = useState("");

  // Authenticate
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminToken.trim()) {
      setIsAuthenticated(true);
      fetchStats();
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://proof-pass-verified-main.vercel.app/api/admin?action=stats",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.dashboard);
        setError("");
      } else {
        setError("Authentication failed. Check your admin token.");
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError("Failed to fetch stats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate new API key
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyNeobank) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://proof-pass-verified-main.vercel.app/api/admin",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "generate-key",
            name: newKeyName,
            neobank: newKeyNeobank,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGeneratedKey(data);
        setNewKeyName("");
        setNewKeyNeobank("");
        setError("");
        setTimeout(() => fetchStats(), 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate key");
      }
    } catch (err) {
      setError("Failed to generate API key");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Enter your admin token to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Admin Token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Demo Token: <code>admin123</code>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage ProofPass ecosystem</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={fetchStats} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAuthenticated(false);
                setStats(null);
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedKey && (
          <Alert className="mb-6 bg-green-900 border-green-700">
            <AlertDescription className="text-green-100">
              <div className="space-y-2">
                <p className="font-bold">✅ API Key Generated!</p>
                <p>Neobank: {generatedKey.neobank}</p>
                <p>Public Key: <code className="bg-black/20 px-2 py-1 rounded">{generatedKey.key}</code></p>
                <p>Secret: <code className="bg-black/20 px-2 py-1 rounded">{generatedKey.secret}</code></p>
                <p className="text-sm text-green-200">{generatedKey.instructions}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.users.verified} verified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.apiKeys.activeKeys}</div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.apiKeys.totalRequests} total requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">NFTs Minted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.blockchain.totalNFTsMinted}</div>
                <p className="text-xs text-gray-500 mt-2">
                  On Polygon Network
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Partner Neobanks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.apiKeys.neobankCount}</div>
                <p className="text-xs text-gray-500 mt-2">
                  Integrated partners
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Users by Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats && Object.entries(stats.users.byTier).map(([tier, count]) => (
                      <div key={tier} className="flex justify-between">
                        <span>{tier}</span>
                        <Badge>{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Users by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats && Object.entries(stats.users.byRegion)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 10)
                      .map(([region, count]) => (
                        <div key={region} className="flex justify-between text-sm">
                          <span>{region}</span>
                          <Badge variant="secondary">{count as number}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate New API Key</CardTitle>
                  <CardDescription>Create API key for neobank partner</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerateKey} className="space-y-4">
                    <Input
                      placeholder="Neobank Name (e.g., Flutterwave)"
                      value={newKeyNeobank}
                      onChange={(e) => setNewKeyNeobank(e.target.value)}
                    />
                    <Input
                      placeholder="Key Name (e.g., Production Key)"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? "Generating..." : "Generate Key"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active API Keys</CardTitle>
                  <CardDescription>Top neobank integrations by request volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats && stats.apiKeys.topNeobanks.map(([neobank, requests]: any) => (
                      <div key={neobank} className="flex justify-between items-center p-3 bg-slate-800 rounded">
                        <div>
                          <p className="font-medium">{neobank}</p>
                          <p className="text-sm text-gray-400">{requests} requests</p>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Network Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Network</p>
                          <p className="text-lg font-bold">Polygon (Matic)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Chain ID</p>
                          <p className="text-lg font-bold">{stats.blockchain.chainId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Confirmed Txns</p>
                          <p className="text-lg font-bold text-green-400">{stats.blockchain.confirmedTransactions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Failed Txns</p>
                          <p className="text-lg font-bold text-red-400">{stats.blockchain.failedTransactions}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-2">Contract Address</p>
                        <code className="block bg-slate-800 p-3 rounded text-sm break-all">
                          {stats.blockchain.contractAddress}
                        </code>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() =>
                          window.open(stats.blockchain.explorerUrl, "_blank")
                        }
                      >
                        View on Polygonscan
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Recent Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stats?.users?.byTier && Object.keys(stats.users).length > 0 ? (
                    <p className="text-sm text-gray-400">
                      Total: {stats.users.total} verified users
                    </p>
                  ) : (
                    <p className="text-gray-500">No users yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
