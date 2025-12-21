import { Check } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Label } from "@/components/ui/label.jsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx";
import { Separator } from "@/components/ui/separator.jsx";

const Pricing4 = ({
  title = "Pricing",
  description = "Check out our affordable pricing plans.",
  plans = [
    {
      name: "Free",
      badge: "Free",
      monthlyPrice: "₹0",
      yearlyPrice: "₹0",
      features: [
        "Unlimited Integrations",
        "Windows, Linux, Mac support",
        "24/7 Support",
        "Free updates",
      ],
      buttonText: "Get Started",
    },
    {
      name: "Pro",
      badge: "Pro",
      monthlyPrice: "₹299",
      yearlyPrice: "₹2999",
      features: [
        "Everything in FREE",
        "Live call suport every month",
        "Unlimited Storage",
      ],
      buttonText: "Purchase",
    },
    {
      name: "Elite",
      badge: "Elite",
      monthlyPrice: "₹499",
      yearlyPrice: "₹4999",
      features: [
        "Everything in PRO",
        "Advanced analytics",
        "Custom branding",
        "Unlimited users",
      ],
      buttonText: "Purchase",
      isPopular: true,
    },
  ],
  className = "",
}) => {
  const [isAnnually, setIsAnnually] = useState(false);
  return (
    <main>
    <section className={`py-16 md:py-24 ${className}`} aria-labelledby="pricing-title">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="text-center space-y-4">
            <h1 id="pricing-title" className="text-4xl font-bold tracking-tight lg:text-5xl">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {description}
            </p>
          </div>
          <div className="flex justify-center">
            <fieldset className="bg-muted flex h-11 w-fit items-center rounded-lg p-1 text-sm" aria-label="Billing period selection">
              <legend className="sr-only">Choose billing period</legend>
              <RadioGroup
                defaultValue="monthly"
                className="h-full grid-cols-2"
                onValueChange={(value) => {
                  setIsAnnually(value === "annually");
                }}
              >
                <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-md transition-all'>
                  <RadioGroupItem
                    value="monthly"
                    id="monthly"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="monthly"
                    className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center px-7 font-semibold"
                  >
                    Monthly
                  </Label>
                </div>
                <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-md transition-all'>
                  <RadioGroupItem
                    value="annually"
                    id="annually"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="annually"
                    className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center gap-1 px-7 font-semibold"
                  >
                    Yearly
                  </Label>
                </div>
              </RadioGroup>
            </fieldset>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8" role="list" aria-label="Pricing plans">
            {plans.map((plan) => (
              <article
                key={plan.name}
                role="listitem"
                className={`flex flex-col rounded-lg border p-6 text-left transition-all hover:shadow-lg ${
                  plan.isPopular ? "bg-muted border-primary shadow-md scale-105" : "bg-card"
                }`}
                aria-label={`${plan.name} plan - ${isAnnually ? plan.yearlyPrice : plan.monthlyPrice} ${isAnnually ? "per year" : "per month"}`}
              >
                <div className="mb-6">
                  <Badge className="mb-4 w-fit uppercase" variant={plan.isPopular ? "default" : "secondary"} aria-label={`${plan.badge} tier`}>
                    {plan.badge}
                  </Badge>
                  <div className="space-y-1">
                    <h2 className="text-4xl font-bold tracking-tight">
                      {isAnnually ? plan.yearlyPrice : plan.monthlyPrice}
                    </h2>
                    <p className={`text-sm text-muted-foreground ${plan.monthlyPrice === "$0" ? "invisible" : ""}`}>
                      {isAnnually ? "Per year" : "Per month"}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" role="separator" />
                <div className="flex flex-1 flex-col justify-between gap-8">
                  <ul className="text-muted-foreground space-y-3 flex-1" aria-label={`${plan.name} plan features`}>
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
                  <Button className="w-full" aria-label={`${plan.buttonText} ${plan.name} plan`}>{plan.buttonText}</Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
    </main>
  );
};

export { Pricing4 };
