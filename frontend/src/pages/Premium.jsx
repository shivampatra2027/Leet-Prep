import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge.jsx";
import { Separator } from "@/components/ui/separator.jsx";
import PaymentButton from "../components/PaymentButton";
import Navbar from "../components/Navbar";
import Seo from "@/components/Seo.jsx";
import { usePremiumStore } from "@/store/usePremiumStore";
import { useAuthStore } from "@/store/useAuthStore";

const PRICING_REGION_KEY = "pricingRegion";

const Pricing4 = ({
  title = "Upgrade to Premium",
  description = "Unlock all features and get unlimited access to all problems.",
  className = "",
}) => {
  const navigate = useNavigate();
  const premium = usePremiumStore((s) => s.premium);
  const premiumLoading = usePremiumStore((s) => s.loading);
  const authLoading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);
  const [region, setRegion] = useState(() => {
    try {
      const savedRegion = localStorage.getItem(PRICING_REGION_KEY);
      return savedRegion === "IN" ? "IN" : "INTL";
    } catch {
      return "INTL";
    }
  });

  useEffect(() => {
    if (premium) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, premium]);

  useEffect(() => {
    try {
      localStorage.setItem(PRICING_REGION_KEY, region);
    } catch (error) {
      console.warn("Unable to persist pricing region:", error);
    }
  }, [region]);

  const currency = region === "IN" ? "INR" : "USD";
  const trialPrice = currency === "INR" ? "Rs 25" : "$1";
  const trialAmount = currency === "INR" ? 2500 : 100;

  const plans =
    currency === "INR"
      ? [
          {
            name: "1 Day Trial Premium",
            badge: "Trial",
            price: trialPrice,
            amount: trialAmount,
            currency,
            duration: 1,
            durationType: "days",
            displayDuration: "24 Hours",
            features: [
              "Access to all 2200+ problems",
              "All company filters unlocked",
              "Advanced analytics dashboard",
              "Progress tracking",
              "LeetCode sync integration",
              "Try before you buy!",
            ],
            buttonText: "Start 1 Day Trial",
          },
          {
            name: "2 Month Premium",
            badge: "Popular",
            price: "Rs 99",
            amount: 9900,
            currency,
            duration: 2,
            durationType: "months",
            displayDuration: "2 Months",
            features: [
              "Access to all 2200+ problems",
              "All company filters unlocked",
              "Advanced analytics dashboard",
              "Progress tracking",
              "LeetCode sync integration",
              "Great for short interview sprints",
            ],
            buttonText: "Get 2 Month Access",
          },
          {
            name: "4 Month Premium",
            badge: "Best Deal",
            price: "Rs 199",
            amount: 19900,
            currency,
            duration: 4,
            durationType: "months",
            displayDuration: "4 Months",
            features: [
              "All features from 2 Month plan",
              "Longer validity for end-to-end prep",
              "Ideal for placement season",
              "Unlimited problem attempts",
              "Priority support",
              "Best value for serious prep",
            ],
            buttonText: "Get 4 Month Access",
            isPopular: true,
            savings: "Best Value",
          },
        ]
      : [
          {
            name: "1 Day Trial Premium",
            badge: "Trial",
            price: trialPrice,
            amount: trialAmount,
            currency,
            duration: 1,
            durationType: "days",
            displayDuration: "24 Hours",
            features: [
              "Access to all 2200+ problems",
              "All company filters unlocked",
              "Advanced analytics dashboard",
              "Progress tracking",
              "LeetCode sync integration",
              "Try before you buy!",
            ],
            buttonText: "Start 1 Day Trial",
          },
          {
            name: "1 Month Premium",
            badge: "Monthly",
            price: "$7",
            amount: 700,
            currency,
            duration: 1,
            durationType: "months",
            displayDuration: "1 Month",
            features: [
              "Access to all 2200+ problems",
              "All company filters unlocked",
              "Advanced analytics dashboard",
              "Progress tracking",
              "LeetCode sync integration",
              "Priority support",
            ],
            buttonText: "Get 1 Month Access",
          },
          {
            name: "2 Month Premium",
            badge: "Best Deal",
            price: "$12",
            amount: 1200,
            currency,
            duration: 2,
            durationType: "months",
            displayDuration: "2 Months",
            features: [
              "All features from 1 Month plan",
              "Better value than monthly billing",
              "Extended validity for interview prep",
              "Unlimited problem attempts",
              "Priority support",
              "Most popular international plan",
            ],
            buttonText: "Get 2 Month Access",
            isPopular: true,
            savings: "Most Popular",
          },
        ];

  if (authLoading || !initialized || premiumLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
      </div>
    );
  }

  if (premium) {
    return null;
  }

  return (
    <>
      <Seo
        title="Premium Coding Interview Prep | Leet-Prep"
        description="Unlock all 1,800+ curated problems, company filters, analytics, and daily focus lanes with Leet-Prep Premium."
        canonical={`${import.meta.env.VITE_SITE_URL || "https://leetcodepremium.xyz"}/premium`}
      />
      <Navbar />
      <main>
        <section
          className={`py-16 md:py-24 ${className}`}
          aria-labelledby="pricing-title"
        >
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex flex-col gap-8">
              <div className="space-y-4 text-center">
                <h1
                  id="pricing-title"
                  className="text-4xl font-bold tracking-tight lg:text-5xl"
                >
                  {title}
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {description}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRegion("IN")}
                    aria-pressed={region === "IN"}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      region === "IN"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground"
                    }`}
                  >
                    <img
                      src="https://flagcdn.com/w20/in.png"
                      alt="India"
                      className="mr-2 inline"
                    />
                    (INR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegion("INTL")}
                    aria-pressed={region === "INTL"}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      region === "INTL"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground"
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>
              <div
                className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                role="list"
                aria-label="Pricing plans"
              >
                {plans.map((plan) => (
                  <article
                    key={plan.name}
                    role="listitem"
                    className={`flex flex-col rounded-lg border p-6 text-left transition-all hover:shadow-lg ${
                      plan.isPopular
                        ? "scale-105 border-primary bg-muted shadow-md"
                        : "bg-card"
                    }`}
                    aria-label={`${plan.name} plan - ${plan.price}`}
                  >
                    <div className="mb-6">
                      <Badge
                        className="mb-4 w-fit uppercase"
                        variant={plan.isPopular ? "default" : "secondary"}
                        aria-label={`${plan.badge} tier`}
                      >
                        {plan.badge}
                      </Badge>
                      {plan.savings && (
                        <p className="mb-2 text-xs font-semibold text-primary">
                          {plan.savings}
                        </p>
                      )}
                      <div className="space-y-1">
                        <h2 className="text-4xl font-bold tracking-tight">
                          {plan.price}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {plan.displayDuration ||
                            `For ${plan.duration} ${plan.duration === 1 ? "month" : "months"}`}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" role="separator" />
                    <div className="flex flex-1 flex-col justify-between gap-8">
                      <ul
                        className="flex-1 space-y-3 text-muted-foreground"
                        aria-label={`${plan.name} plan features`}
                      >
                        {plan.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center gap-2"
                          >
                            <Check className="size-4" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <PaymentButton
                        amount={plan.amount}
                        currency={plan.currency || "INR"}
                        duration={plan.duration}
                        durationType={plan.durationType || "months"}
                        planName={plan.name}
                        buttonText={plan.buttonText}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export { Pricing4 };
