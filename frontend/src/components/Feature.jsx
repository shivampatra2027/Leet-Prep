import { ArrowRight, Gauge, ListChecks, Sparkles, Target, Timer, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge.jsx";

const features = [
  {
    icon: Target,
    title: "Signal-led filters",
    description: "Company, round, and difficulty filters tuned to what interviewers actually ask instead of noisy tags.",
    meta: "Precision over volume",
    accent: "from-cyan-500/25 via-cyan-500/5 to-transparent",
  },
  {
    icon: Timer,
    title: "Focus blocks",
    description: "45-minute sessions with warmups, mid-round prompts, and a fast debrief so you build recall, not fatigue.",
    meta: "Zero wasted minutes",
    accent: "from-emerald-400/25 via-emerald-400/5 to-transparent",
  },
  {
    icon: Gauge,
    title: "Pace that adapts",
    description: "Auto-adjusted sequences based on correctness, hesitation, and the companies you selected.",
    meta: "Adaptive difficulty",
    accent: "from-amber-400/25 via-amber-400/5 to-transparent",
  },
  {
    icon: Code,
    title: "Editorial + code together",
    description: "Solutions, trade-offs, and runnable code side-by-side so you can narrate answers the way panels expect.",
    meta: "Story-first answers",
    accent: "from-indigo-400/25 via-indigo-400/5 to-transparent",
  },
  {
    icon: ListChecks,
    title: "Company playbooks",
    description: "Patterns, favorite topics, and pitfalls for 50+ teams, refreshed monthly from interview reports.",
    meta: "Continuously updated",
    accent: "from-pink-400/25 via-pink-400/5 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Premium analytics",
    description: "Outcomes, streak health, and frequency charts that tell you when to double down or reset.",
    meta: "Built for growth",
    accent: "from-purple-400/25 via-purple-400/5 to-transparent",
  },
];

const Feature = () => {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
          <Badge className="bg-foreground/5 text-muted-foreground border-border">Why it feels senior</Badge>
          <h1 className="text-pretty text-4xl font-display lg:text-5xl text-foreground">
            Tools that keep you in a professional rhythm
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Designed to make every session count, whether you have 20 minutes or a full evening to prepare.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative overflow-hidden rounded-2xl border bg-card/60 glass p-6 h-full shadow-glow"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accent}`} />
              <div className="relative flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <span className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary" className="bg-background/70 text-foreground border-border">
                    {feature.meta}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 text-sm text-primary">
                  See how it works
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Feature };
