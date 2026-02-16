import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge.jsx";
import { Separator } from "@/components/ui/separator.jsx";
import PaymentButton from "../components/PaymentButton";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileAPI } from "../lib/api";
import Seo from "@/components/Seo.jsx";

const Pricing4 = ({
  title = "Upgrade to Premium",
  description = "Unlock all features and get unlimited access to all problems.",
  className = "",
}) => {
  const navigate = useNavigate();
  const [userTier, setUserTier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserTier = async () => {
      try {
        const response = await profileAPI.getProfile();
        const tier = response.data.tier || "free";
        setUserTier(tier);
        
        // Redirect premium users to dashboard
        if (tier === "premium") {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    checkUserTier();
  }, [navigate]);

  const plans = [
    {
      name: "1 Day Trial",
      badge: "Try It",
      price: "₹5",
      amount: 500, // in paise
      duration: 1,
      durationType: "days", // NEW: specify duration type
      displayDuration: "24 Hours",
      features: [
        "Access to all 2200+ problems",
        "All company filters unlocked",
        "Advanced analytics dashboard",
        "Progress tracking",
        "LeetCode sync integration",
        "Perfect for quick prep",
      ],
      buttonText: "Get 1 Day Access",
    },
    {
      name: "1 Month Premium",
      badge: "Monthly",
      price: "₹199",
      amount: 19900, // in paise
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
      price: "₹349",
      amount: 34900, // in paise
      duration: 2,
      durationType: "months",
      displayDuration: "2 Months",
      features: [
        "All features from 1 Month plan",
        "Save ₹49 (12% off)",
        "Extended validity - 60 days",
        "Perfect for interview prep",
        "Unlimited problem attempts",
        "Priority support",
      ],
      buttonText: "Get 2 Month Access",
      isPopular: true,
      savings: "Most Popular - Save ₹49",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
      </div>
    );
  }

  // Don't show premium page to already premium users (will be redirected)
  if (userTier === "premium") {
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
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex flex-col gap-8">
              <div className="text-center space-y-4">
                <h1
                  id="pricing-title"
                  className="text-4xl font-bold tracking-tight lg:text-5xl"
                >
                  {title}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {description}
                </p>
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto"
                role="list"
                aria-label="Pricing plans"
              >
                {plans.map((plan) => (
                  <article
                    key={plan.name}
                    role="listitem"
                    className={`flex flex-col rounded-lg border p-6 text-left transition-all hover:shadow-lg ${plan.isPopular
                        ? "bg-muted border-primary shadow-md scale-105"
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
                        <p className="text-xs text-primary font-semibold mb-2">
                          {plan.savings}
                        </p>
                      )}
                      <div className="space-y-1">
                        <h2 className="text-4xl font-bold tracking-tight">
                          {plan.price}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {plan.displayDuration || `For ${plan.duration} ${plan.duration === 1 ? "month" : "months"}`}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" role="separator" />
                    <div className="flex flex-1 flex-col justify-between gap-8">
                      <ul
                        className="text-muted-foreground space-y-3 flex-1"
                        aria-label={`${plan.name} plan features`}
                      >
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <Check className="size-4" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <PaymentButton
                        amount={plan.amount}
                        duration={plan.duration}
                        durationType={plan.durationType || "months"}
                        planName={plan.name}
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
