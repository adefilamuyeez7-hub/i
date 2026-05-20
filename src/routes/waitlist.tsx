import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowUpRight, Share2, Users, Trophy } from 'lucide-react'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [joinedWaitlist, setJoinedWaitlist] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [referrals, setReferrals] = useState(0)
  const [tweetedDone, setTweetedDone] = useState(false)
  const [canMint, setCanMint] = useState(false)
  const [minted, setMinted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Generate referral code on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('waitlistEmail')
    const savedCode = localStorage.getItem('referralCode')
    const savedReferrals = localStorage.getItem('referrals')
    const savedTweeted = localStorage.getItem('tweetedDone')
    const savedMinted = localStorage.getItem('minted')

    if (savedEmail) {
      setEmail(savedEmail)
      setJoinedWaitlist(true)
    }
    if (savedCode) {
      setReferralCode(savedCode)
    }
    if (savedReferrals) {
      setReferrals(parseInt(savedReferrals))
    }
    if (savedTweeted) {
      setTweetedDone(savedTweeted === 'true')
    }
    if (savedMinted) {
      setMinted(savedMinted === 'true')
    }
  }, [])

  // Check if can mint (joined + tweeted + 2 referrals)
  useEffect(() => {
    const canMintNow = joinedWaitlist && tweetedDone && referrals >= 2
    setCanMint(canMintNow)
  }, [joinedWaitlist, tweetedDone, referrals])

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      // Generate unique referral code
      const code = `ref_${Math.random().toString(36).slice(2, 9).toUpperCase()}`
      
      // Save to localStorage
      localStorage.setItem('waitlistEmail', email)
      localStorage.setItem('referralCode', code)
      localStorage.setItem('referrals', '0')
      
      setReferralCode(code)
      setJoinedWaitlist(true)
      setReferrals(0)
    } finally {
      setLoading(false)
    }
  }

  const handleTweet = () => {
    const referralUrl = `https://proofpass.xyz/waitlist?ref=${referralCode}`
    const tweetText = `I just joined ProofPass waitlist! Be in-charge of your KYC data. No expensive middlemen. 🚀\n\nJoin me: ${referralUrl}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    
    setTimeout(() => {
      setTweetedDone(true)
      localStorage.setItem('tweetedDone', 'true')
    }, 1000)
  }

  const handleAddReferral = () => {
    const newCount = referrals + 1
    setReferrals(newCount)
    localStorage.setItem('referrals', newCount.toString())
  }

  const handleMint = async () => {
    if (!canMint || minted) return

    setLoading(true)
    try {
      // Mock NFT minting - in production, would interact with blockchain
      const token = `Token #${Math.random().toString(16).slice(2, 10).toUpperCase()}`
      
      localStorage.setItem('minted', 'true')
      localStorage.setItem('earlyProofToken', token)
      
      setMinted(true)
      alert(`🎉 Early Proof Minted!\n\n${token}\n\nYou're in the VIP club!`)
    } finally {
      setLoading(false)
    }
  }

  const referralUrl = `https://proofpass.xyz/waitlist?ref=${referralCode}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-emerald-600">ProofPass</div>
          <div className="text-sm text-gray-600">Early Access</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 p-6 bg-white rounded-full shadow-lg">
            <Trophy className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Be In-Charge of Your KYC Data
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            No expensive middlemen. Own your identity verification. Mint your Early Proof and join the revolution.
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/95 backdrop-blur border-emerald-100 shadow-xl mb-12 overflow-hidden">
          <div className="relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-100/50 rounded-full -ml-36 -mb-36" />

            <div className="relative p-8 md:p-12">
              {!joinedWaitlist ? (
                // Join Waitlist Section
                <form onSubmit={handleJoinWaitlist} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your email
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                      >
                        {loading ? 'Joining...' : 'Join Waitlist'}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Get exclusive early access and VIP benefits
                  </p>
                </form>
              ) : (
                // After Join - Show Progress
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome to ProofPass! 🎉
                    </h2>
                    <p className="text-gray-600">
                      You're in! Now complete these steps to mint your Early Proof.
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Step 1: Already Done */}
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                          ✓
                        </div>
                        <span className="font-semibold text-gray-900">Join Waitlist</span>
                      </div>
                      <p className="text-sm text-gray-600">{email}</p>
                    </div>

                    {/* Step 2: Tweet */}
                    <div className={`p-4 rounded-lg border-2 transition-colors ${
                      tweetedDone 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-gray-50 border-gray-200 hover:border-emerald-300'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          tweetedDone 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {tweetedDone ? '✓' : '2'}
                        </div>
                        <span className="font-semibold text-gray-900">Share on Twitter</span>
                      </div>
                      <Button
                        onClick={handleTweet}
                        disabled={tweetedDone}
                        className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {tweetedDone ? 'Tweeted ✓' : 'Tweet Now'}
                      </Button>
                    </div>

                    {/* Step 3: Referrals */}
                    <div className={`p-4 rounded-lg border-2 transition-colors ${
                      referrals >= 2 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          referrals >= 2 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {referrals >= 2 ? '✓' : '3'}
                        </div>
                        <span className="font-semibold text-gray-900">2 Referrals</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {referrals}/2 referred
                      </p>
                      <Button
                        onClick={handleAddReferral}
                        disabled={referrals >= 2}
                        variant="outline"
                        className="w-full"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Add Referral
                      </Button>
                    </div>
                  </div>

                  {/* Referral Code Section */}
                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Share Your Referral Link</h3>
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={referralUrl}
                        readOnly
                        className="bg-white text-sm"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(referralUrl)
                          alert('Referral link copied!')
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Share with friends to earn referrals
                    </p>
                  </div>

                  {/* Mint Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      onClick={handleMint}
                      disabled={!canMint || minted || loading}
                      className={`w-full py-6 text-lg font-bold ${
                        canMint && !minted
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                          : 'bg-gray-400'
                      } text-white`}
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      {minted 
                        ? 'Early Proof Minted! 🎉' 
                        : !canMint 
                          ? `Complete all steps to mint (${(joinedWaitlist ? 1 : 0) + (tweetedDone ? 1 : 0) + (referrals >= 2 ? 1 : 0)}/3)`
                          : 'Mint Your Early Proof NFT'}
                    </Button>
                    {minted && (
                      <p className="text-center text-sm text-emerald-600 mt-4 font-semibold">
                        ✨ You've unlocked VIP early access!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-white/80 border-emerald-100">
            <h3 className="font-semibold text-gray-900 mb-2">No Data Storage</h3>
            <p className="text-sm text-gray-600">
              You own your KYC data. We never store or sell it.
            </p>
          </Card>
          <Card className="p-6 bg-white/80 border-emerald-100">
            <h3 className="font-semibold text-gray-900 mb-2">Zero Fees</h3>
            <p className="text-sm text-gray-600">
              Verify once, use everywhere. No expensive middlemen.
            </p>
          </Card>
          <Card className="p-6 bg-white/80 border-emerald-100">
            <h3 className="font-semibold text-gray-900 mb-2">Early Access</h3>
            <p className="text-sm text-gray-600">
              VIP members get priority support and exclusive features.
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
