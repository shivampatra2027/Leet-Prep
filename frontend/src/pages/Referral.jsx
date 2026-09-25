import React, { useEffect, useState } from "react";
import { Copy, Check, Share2, Gift, Trophy, Star, Zap, Crown, Award } from "lucide-react";
import { FaWhatsapp, FaTelegram, FaLinkedin, FaTwitter } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import { Footer7 } from "@/components/Footer";
import { referralAPI } from "@/lib/api";
import { useReferralStore } from "@/store/useReferralStore";

// ─── Badge meta ────────────────────────────────────────────────────────────
const BADGE_META = {
  first_referral:    { icon: "🥇", label: "First Referral",    color: "text-yellow-500" },
  ten_referrals:     { icon: "🔟", label: "10 Referrals",       color: "text-blue-500" },
  hundred_referrals: { icon: "💯", label: "100 Referrals",      color: "text-purple-500" },
  first_purchase:    { icon: "💳", label: "First Purchase",     color: "text-green-500" },
  ten_purchases:     { icon: "🛒", label: "10 Purchases",       color: "text-orange-500" },
  points_1000:       { icon: "⭐", label: "1,000 Points",       color: "text-amber-500" },
  points_5000:       { icon: "🌟", label: "5,000 Points",       color: "text-pink-500" },
};

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://leetcodepremium.xyz";
const REFERRAL_REFRESH_NOTE =
  "Referral rewards are processed in background and can take up to 30 minutes to appear.";

// Product images for physical prizes (keyed by prize id)
const PRIZE_IMAGES = {
  iphone_17: "/iphone17.jpg",
  macbook_air: "/macbookair.jpg",
  galaxy_watch_8: "/galaxywatch8.jpg",
};

// ─── Share presets ──────────────────────────────────────────────────────────
function getShareMessages(url) {
  return {
    whatsapp: `Bro this site has all company DSA questions free\nUse my link and you also get premium trial 🚀\n${url}`,
    telegram: `Preparing for placements?\n\nI use this tracker for company-wise questions:\n${url}\n\nYou also get premium access when joining.`,
    linkedin: `I've been using this platform to track company-wise DSA prep.\n\nHelpful for placement prep:\n${url}`,
    twitter: `Tracking company-wise DSA questions for placements using Leet-Prep 🚀\n\nJoin using my link:\n${url}`,
  };
}

// ─── Small utility: copy-to-clipboard button ────────────────────────────────
function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Referral() {
  const data = useReferralStore((s) => s.data);
  const storeLoading = useReferralStore((s) => s.loading);
  const storeError = useReferralStore((s) => s.error);
  const fetchReferral = useReferralStore((s) => s.fetchReferral);
  const joinReferral = useReferralStore((s) => s.joinReferral);

  const [leaderboard, setLeaderboard] = useState({ weekly: [], allTime: [] });
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | leaderboard
  const [redeemStatus, setRedeemStatus] = useState({});

  const loading = storeLoading || loadingLeaderboard;
  const error = storeError || leaderboardError;

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinReferral();
      await fetchReferral();
    } catch (err) {
      setLeaderboardError(
        err.response?.data?.error || "Failed to join referral program",
      );
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    setLoadingLeaderboard(true);
    referralAPI
      .getLeaderboard()
      .then((lbRes) => {
        setLeaderboard(lbRes.data);
        setLeaderboardError(null);
      })
      .catch((err) => {
        setLeaderboardError(
          err.response?.data?.error || "Failed to load referral data",
        );
      })
      .finally(() => {
        setLoadingLeaderboard(false);
      });
  }, []);

  const handleRedeem = async (tierId) => {
    if (redeemStatus[tierId] === "loading") return;
    setRedeemStatus((s) => ({ ...s, [tierId]: "loading" }));
    try {
      const res = await referralAPI.redeem(tierId);
      const msg = res.data.physical ? res.data.message : "success";
      setRedeemStatus((s) => ({ ...s, [tierId]: msg }));
      await fetchReferral();
      // Auto-clear non-physical success after 3s
      if (!res.data.physical) {
        setTimeout(() => setRedeemStatus((s) => ({ ...s, [tierId]: null })), 3000);
      }
    } catch (err) {
      setRedeemStatus((s) => ({
        ...s,
        [tierId]: err.response?.data?.error || "Failed",
      }));
      setTimeout(() => setRedeemStatus((s) => ({ ...s, [tierId]: null })), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-1 flex items-center justify-center text-muted-foreground">{error}</div>
      </div>
    );
  }

  // User hasn't joined the referral program yet — show opt-in + public leaderboard
  if (data?.joined === false) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* <Navbar /> */}
        <main className="flex-1">

          {/* Same hero as joined view */}
          <section className="relative overflow-hidden border-b">
            <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-5">
                <Gift className="h-4 w-4" />
                Referral Program
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
                Invite friends. Earn rewards.
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Share your link, earn points, unlock free premium days.
              </p>
              <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                {REFERRAL_REFRESH_NOTE}
              </div>

              {/* Join button */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:cursor-wait"
                >
                  {joining ? (
                    <><span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Activating…</>
                  ) : (
                    <><Gift className="h-5 w-5" /> Join the Referral Program</>
                  )}
                </button>
                <p className="text-xs text-muted-foreground">Free for everyone · No credit card · Link generated instantly</p>
              </div>
            </div>
          </section>

          {/* Prize preview */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wide">Win real prizes</p>
            <div className="flex items-end justify-center gap-4">
              <div className="rounded-2xl border bg-card/60 p-3 shadow-sm rotate-[-4deg] w-28 flex-shrink-0">
                <img src="/iphone17.jpg" alt="iPhone 17" className="w-full h-28 object-contain" />
                <p className="text-xs font-semibold text-center mt-1">iPhone 17</p>
                <p className="text-[10px] text-muted-foreground text-center">10,000 pts</p>
              </div>
              <div className="rounded-2xl border-2 border-yellow-500/40 bg-yellow-500/5 p-3 shadow-lg z-10 w-36 flex-shrink-0">
                <img src="/macbookair.jpg" alt="MacBook Air" className="w-full h-32 object-contain" />
                <p className="text-xs font-semibold text-center mt-1">MacBook Air M2</p>
                <p className="text-[10px] text-muted-foreground text-center">20,000 pts</p>
              </div>
              <div className="rounded-2xl border bg-card/60 p-3 shadow-sm rotate-[4deg] w-28 flex-shrink-0">
                <img src="/galaxywatch8.jpg" alt="Galaxy Watch 8" className="w-full h-28 object-contain" />
                <p className="text-xs font-semibold text-center mt-1">Galaxy Watch 8</p>
                <p className="text-[10px] text-muted-foreground text-center">10,000 pts</p>
              </div>
            </div>
          </section>

          {/* Public Leaderboard */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" /> Leaderboard
              </h2>
              <p className="text-sm text-muted-foreground mt-1">See who's leading — join to compete.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" /> Weekly Top 20
                  <span className="ml-auto text-xs text-muted-foreground font-normal">Resets every Monday</span>
                </h3>
                <LeaderboardTable rows={leaderboard.weekly} pointsKey="points" />
              </div>
              <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" /> All-Time Top 20
                </h3>
                <LeaderboardTable rows={leaderboard.allTime} pointsKey="points" showBadges />
              </div>
            </div>
          </section>
        </main>
        <Footer7 />
      </div>
    );
  }

  const { referralUrl, referralCode, stats, badges, recentReferrals, redemptionTiers, prizeClaims } = data;
  const premiumTiers  = redemptionTiers.filter((t) => t.type === "premium");
  const physicalPrizes = redemptionTiers.filter((t) => t.type === "physical");
  const shareMessages = getShareMessages(referralUrl);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* <Navbar /> */}

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-5">
              <Gift className="h-4 w-4" />
              Referral Program
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
              Invite friends. Earn rewards.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Share your link, earn points, unlock free premium days.
            </p>
            <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
              {REFERRAL_REFRESH_NOTE}
            </div>
          </div>
        </section>

        {/* Points summary cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid gap-4 grid-cols-2 sm:grid-cols-4">
          {[
            { label: "Total Points", value: stats.totalPoints, icon: <Star className="h-5 w-5 text-yellow-500" /> },
            { label: "Weekly Points", value: stats.weeklyPoints, icon: <Zap className="h-5 w-5 text-blue-500" /> },
            { label: "Signups", value: stats.totalSignups, icon: <Share2 className="h-5 w-5 text-green-500" /> },
            { label: "Purchases", value: stats.totalPurchases, icon: <Crown className="h-5 w-5 text-purple-500" /> },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border bg-card/60 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</span>
                {c.icon}
              </div>
              <p className="text-3xl font-bold">{c.value.toLocaleString()}</p>
            </div>
          ))}
        </section>

        {/* Tab switcher */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
          <div className="inline-flex rounded-xl border bg-muted/30 p-1 gap-1">
            {["overview", "leaderboard"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "overview" ? "My Referrals" : "🏆 Leaderboard"}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 grid gap-8 lg:grid-cols-2">
            {/* Left: link + share */}
            <div className="flex flex-col gap-6">
              {/* Referral link */}
              <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-3">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" /> Your referral link
                </h2>
                <div className="flex items-center gap-2 rounded-xl border bg-background/60 px-3 py-2 text-sm font-mono break-all">
                  <span className="flex-1 text-primary">{referralUrl}</span>
                  <CopyButton text={referralUrl} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Code: <span className="font-semibold text-foreground">{referralCode}</span>
                </p>
              </div>

              {/* Share buttons */}
              <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-4">
                <h2 className="text-base font-semibold">Share via</h2>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareMessages.whatsapp)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-green-500/10 hover:border-green-500/30 transition-colors"
                  >
                    <FaWhatsapp className="h-5 w-5 text-green-500" /> WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareMessages.telegram)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors"
                  >
                    <FaTelegram className="h-5 w-5 text-blue-400" /> Telegram
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-blue-700/10 hover:border-blue-700/30 transition-colors"
                  >
                    <FaLinkedin className="h-5 w-5 text-blue-700" /> LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessages.twitter)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-sky-500/10 hover:border-sky-500/30 transition-colors"
                  >
                    <FaTwitter className="h-5 w-5 text-sky-500" /> Twitter / X
                  </a>
                </div>

                {/* Copy-ready messages */}
                <details className="mt-1">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    Copy pre-filled messages ▾
                  </summary>
                  <div className="flex flex-col gap-3 mt-3">
                    {Object.entries(shareMessages).map(([platform, msg]) => (
                      <div key={platform} className="rounded-xl border bg-background/40 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold capitalize text-muted-foreground">{platform}</span>
                          <CopyButton text={msg} />
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{msg}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>

              {/* Points rewards table */}
              <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-3">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> How points work
                </h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide border-b">
                      <th className="pb-2">Action</th>
                      <th className="pb-2 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[
                      { action: "Friend signs up", pts: "+1" },
                      { action: "Friend active next day", pts: "+5" },
                      { action: "Friend buys premium", pts: "+50" },
                    ].map((r) => (
                      <tr key={r.action}>
                        <td className="py-2 text-muted-foreground">{r.action}</td>
                        <td className="py-2 text-right font-semibold text-primary">{r.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: redeem + badges + recent */}
            <div className="flex flex-col gap-6">
              {/* Redeem — Premium */}
              <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-4">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" /> Redeem for Premium
                </h2>
                <p className="text-xs text-muted-foreground">
                  Current points: <span className="font-bold text-foreground text-sm">{stats.totalPoints.toLocaleString()}</span>
                </p>
                <div className="flex flex-col gap-3">
                  {premiumTiers.map((tier) => {
                    const canRedeem = stats.totalPoints >= tier.points;
                    const status = redeemStatus[tier.id];
                    return (
                      <div key={tier.id} className="flex items-center justify-between rounded-xl border bg-background/40 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{tier.label}</p>
                          <p className="text-xs text-muted-foreground">{tier.points.toLocaleString()} points</p>
                        </div>
                        <button
                          onClick={() => handleRedeem(tier.id)}
                          disabled={!canRedeem || status === "loading"}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            status === "success"
                              ? "bg-green-500/20 text-green-600 border border-green-500/30"
                              : canRedeem
                              ? "bg-primary text-primary-foreground hover:-translate-y-0.5 shadow-sm"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          {status === "loading" ? "..." : status === "success" ? "✓ Done!" : typeof status === "string" ? status : "Redeem"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grand Prizes — physical */}
              <div className="rounded-2xl border bg-gradient-to-br from-yellow-500/5 via-background to-purple-500/5 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <span className="text-xl">🏆</span> Grand Prizes
                  </h2>
                  <span className="text-xs text-muted-foreground rounded-full border px-2.5 py-0.5">Limited</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Reach the threshold, claim your prize — we’ll contact you for shipping details via email.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {physicalPrizes.map((prize) => {
                    const canClaim = stats.totalPoints >= prize.points;
                    const status = redeemStatus[prize.id];
                    const alreadyClaimed = prizeClaims?.some((c) => c.prize === prize.id && c.status === "pending");
                    const isPhysicalSuccess = typeof status === "string" && status.startsWith("🎉");
                    return (
                      <div
                        key={prize.id}
                        className={`relative rounded-2xl border-2 p-5 flex flex-col gap-3 transition-all ${
                          canClaim
                            ? "border-yellow-500/40 bg-yellow-500/5"
                            : "border-border bg-background/30 opacity-70"
                        }`}
                      >
                        {canClaim && !alreadyClaimed && (
                          <span className="absolute top-3 right-3 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-600 text-[10px] font-bold px-2 py-0.5">
                            ELIGIBLE
                          </span>
                        )}
                        {alreadyClaimed && (
                          <span className="absolute top-3 right-3 rounded-full bg-green-500/20 border border-green-500/30 text-green-600 text-[10px] font-bold px-2 py-0.5">
                            CLAIMED ✓
                          </span>
                        )}
                        {/* Product image */}
                        <div className="w-full flex items-center justify-center h-36 rounded-xl overflow-hidden bg-muted/30">
                          {PRIZE_IMAGES[prize.id] ? (
                            <img
                              src={PRIZE_IMAGES[prize.id]}
                              alt={prize.label}
                              className="h-full w-full object-contain p-2"
                              onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                            />
                          ) : null}
                          <div
                            className="text-5xl items-center justify-center h-full w-full"
                            style={{ display: PRIZE_IMAGES[prize.id] ? "none" : "flex" }}
                          >
                            {prize.icon}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{prize.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{prize.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-1">
                          <span className="text-xs font-bold text-primary">{prize.points.toLocaleString()} pts</span>
                          <button
                            onClick={() => handleRedeem(prize.id)}
                            disabled={!canClaim || status === "loading" || alreadyClaimed}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                              alreadyClaimed
                                ? "bg-green-500/20 text-green-600 border border-green-500/30 cursor-not-allowed"
                                : isPhysicalSuccess
                                ? "bg-green-500/20 text-green-600 border border-green-500/30"
                                : canClaim
                                ? "bg-yellow-500 text-black hover:-translate-y-0.5 shadow-md hover:bg-yellow-400"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                          >
                            {status === "loading" ? "..." : alreadyClaimed ? "Pending" : isPhysicalSuccess ? "✓ Claimed!" : "Claim"}
                          </button>
                        </div>
                        {/* Show success instruction inline */}
                        {isPhysicalSuccess && (
                          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-700 dark:text-green-400 leading-relaxed">
                            {status}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground/70 text-center">
                  Prize eligibility is verified before dispatch. One per account.
                </p>
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-3">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" /> Badges earned
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((b, i) => {
                      const m = BADGE_META[b.type] || { icon: "🏅", label: b.type, color: "text-foreground" };
                      return (
                        <div key={i} className="flex items-center gap-1.5 rounded-full border bg-background/40 px-3 py-1 text-xs font-medium">
                          <span>{m.icon}</span>
                          <span className={m.color}>{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent referrals */}
              {recentReferrals.length > 0 && (
                <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-3">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" /> Recent activity
                  </h2>
                  <div className="flex flex-col divide-y divide-border/40">
                    {recentReferrals.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5">
                        {r.avatar ? (
                          <img src={r.avatar} alt={r.name} className="h-7 w-7 rounded-full" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {r.name?.[0] || "?"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground capitalize">{r.type.replace(/_/g, " ")}</p>
                        </div>
                        <span className="text-sm font-semibold text-green-500">+{r.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 grid gap-8 lg:grid-cols-2">
            {/* Weekly leaderboard */}
            <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" /> Weekly Top 20
                <span className="ml-auto text-xs text-muted-foreground font-normal">Resets every Monday</span>
              </h2>
              <LeaderboardTable rows={leaderboard.weekly} pointsKey="points" />
            </div>
            {/* All-time leaderboard */}
            <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" /> All-Time Top 20
              </h2>
              <LeaderboardTable rows={leaderboard.allTime} pointsKey="points" showBadges />
            </div>
          </div>
        )}
      </main>

      <Footer7 />
    </div>
  );
}

function LeaderboardTable({ rows, pointsKey, showBadges = false }) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground text-center py-6">No entries yet. Be the first!</p>;
  }
  return (
    <div className="flex flex-col divide-y divide-border/40">
      {rows.map((row) => (
        <div key={row.rank} className="flex items-center gap-3 py-3">
          <span className={`w-7 text-center text-sm font-bold ${
            row.rank === 1 ? "text-yellow-500" : row.rank === 2 ? "text-slate-400" : row.rank === 3 ? "text-amber-600" : "text-muted-foreground"
          }`}>
            {row.rank <= 3 ? ["🥇","🥈","🥉"][row.rank - 1] : `#${row.rank}`}
          </span>
          {row.avatar ? (
            <img src={row.avatar} alt={row.name} className="h-7 w-7 rounded-full" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {row.name?.[0] || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{row.name}</p>
            {showBadges && row.badges?.length > 0 && (
              <div className="flex gap-1 mt-0.5 flex-wrap">
                {row.badges.slice(0, 3).map((b) => (
                  <span key={b} className="text-xs">{BADGE_META[b]?.icon || "🏅"}</span>
                ))}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-primary">{row[pointsKey]?.toLocaleString()} pts</span>
        </div>
      ))}
    </div>
  );
}
