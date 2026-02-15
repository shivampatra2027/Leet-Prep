import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Timer,
  Compass,
  LineChart,
  Cloud,
  GitBranch,
  Code,
  Atom,
  Server,
  Database,
} from "lucide-react";
import Navbar from "@/components/Navbar.jsx";
import Seo from "@/components/Seo.jsx";

// Lazy load components below the fold
const TestimonialSection = lazy(() =>
  import("@/components/TestimonialSection.jsx").then((module) => ({
    default: module.TestimonialSection,
  }))
);
const Feature = lazy(() =>
  import("@/components/Feature.jsx").then((module) => ({
    default: module.Feature,
  }))
);
const Footer7 = lazy(() =>
  import("@/components/Footer.jsx").then((module) => ({
    default: module.Footer7,
  }))
);

// Loading fallback component
const SectionLoader = () => (
  <div className="w-full py-24 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const HeroSection = () => {
  const stats = [
    { label: "Problems", value: "1,800+", hint: "curated, de-duplicated" },
    { label: "Companies", value: "50+", hint: "patterns and frequency" },
    { label: "Avg. uplift", value: "36%", hint: "offers after 4 weeks" },
  ];

  const playbook = [
    "Company-first roadmaps",
    "Code, hints, editorial together",
    "Signal-driven filters only",
  ];

  return (
    <section className="relative isolate overflow-hidden pb-12 pt-10 lg:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.04]" />
      <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute right-6 top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <div className="inline-flex items-center gap-3 rounded-full glass border px-4 py-2 text-sm shadow-glow">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-muted-foreground">Interview prep, rebuilt for 2026</span>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground/80">
                Company-wise DSA platform
              </p>
              <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                Build sharp, company-ready habits -- not just streaks.
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Leet-Prep curates the exact 1,800+ problems and patterns real teams ask for. Guided paths, honest
                difficulty, and analytics that keep you on signal -- not noise.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild className="shadow-glow">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Start practicing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="glass border-primary/30">
                <Link to="/premium" className="flex items-center gap-2">
                  Premium
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="glass border px-3 py-2 sm:px-4 sm:py-3 rounded-2xl">
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mt-8 lg:mt-0">
              <div className="glass border shadow-glow rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 sm:h-10 sm:w-10 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
                      <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Company mode</p>
                      <p className="text-xs sm:text-sm font-semibold">Google / Meta / Amazon</p>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Smart filters</span>
                    <span className="sm:hidden">Smart</span>
                  </Badge>
                </div>

                <div className="rounded-2xl border bg-secondary/40 p-4 bg-grid relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                  <div className="relative space-y-2 font-mono text-sm text-muted-foreground">
                    <div className="flex items-center justify-between text-foreground">
                      <span className="text-xs px-2 py-1 rounded-full bg-foreground/5">Top signal set</span>
                      <span className="text-xs text-muted-foreground">Updated Feb 2026</span>
                    </div>
                    <p className="text-foreground">
                      {"if (candidate.confidence < 0.7) { practice(\"graphs\"); refine(); }"}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Graph traversal", "DP patterns", "SQL joins", "System design"].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-background/60 px-3 py-1 text-xs text-foreground border border-border/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-sm">
                  {[
                    { label: "Offer rate", value: "72%", accent: "text-emerald-400" },
                    { label: "Daily focus", value: "45m", accent: "text-primary" },
                    { label: "Consistency", value: "6.4x", accent: "text-accent" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border bg-card/60 px-2 py-2 sm:px-3 sm:py-3">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
                      <p className={`text-base sm:text-lg font-semibold ${item.accent}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -left-6 -bottom-10 hidden md:block">
                <div className="glass border shadow-glow rounded-2xl px-4 py-3 w-60">
                  <p className="text-xs text-muted-foreground">Daily focus recipe</p>
                  <div className="mt-2 space-y-2">
                    {playbook.map((line) => (
                      <div key={line} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://leet-prep.vercel.app";

  const steps = [
    {
      title: "Pick your target companies",
      description: "Select the stack, difficulty, and roles you care about. We surface the problems interviewers actually ask.",
      meta: "2 min setup",
      icon: Compass,
    },
    {
      title: "Follow the weekly focus lane",
      description: "Daily 45-minute blocks blend fundamentals, company repeats, and editorial-backed hints so you retain faster.",
      meta: "Smart cadence",
      icon: Timer,
    },
    {
      title: "Ship interview-ready answers",
      description: "Story-first explanations, complexity trade-offs, and checkpoints to rehearse aloud before the real panel.",
      meta: "Review mode",
      icon: LineChart,
    },
  ];

  const techGroups = [
    { title: "Languages", icon: Code, items: ["Python", "Java", "JavaScript", "TypeScript", "C++"] },
    { title: "Frontend", icon: Atom, items: ["React", "Next.js", "Tailwind", "Figma handoff"] },
    { title: "Backend", icon: Server, items: ["Node.js", "Express", "Django", "REST", "GraphQL"] },
    { title: "Data", icon: Database, items: ["PostgreSQL", "MongoDB", "SQL", "Redis", "Kafka"] },
    { title: "Cloud & DevOps", icon: Cloud, items: ["AWS", "GCP", "Docker", "Kubernetes"] },
    { title: "Collaboration", icon: GitBranch, items: ["Git", "System Design", "Patterns", "Code Reviews"] },
  ];

  return (
    <div className="min-h-screen hero-surface text-foreground relative overflow-hidden">
      <Seo
        title="Leet-Prep | Company-wise LeetCode-style Problems & Interview Practice"
        description="1,800+ curated problems by company and pattern, honest difficulty, analytics, and daily focus lanes for FAANG-level interviews."
        canonical={`${siteUrl}/`}
        ogImage="https://img.logo.dev/leetcode.com?token=public"
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Leet-Prep",
          url: `${siteUrl}/`,
          description:
            "Company-wise coding interview prep with curated problem sets, analytics, and daily practice plans.",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.05]" />
      <Navbar />

      <div className="relative">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <Suspense fallback={<SectionLoader />}>
          <Feature />
        </Suspense>

        {/* Steps Section */}
        <section className="py-20 lg:py-24 bg-card/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              <p className="text-sm font-mono uppercase tracking-[0.18em] text-primary">Playbook</p>
              <h2 className="font-display text-3xl md:text-4xl leading-tight">
                A senior-level prep system in three moves.
              </h2>
              <p className="text-lg text-muted-foreground">
                Each lane is time-boxed, measurable, and tuned to company signals. No endless scrolling, no guesswork.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
                <div className="glass border rounded-2xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">Time-boxed blocks</p>
                  <p className="text-lg sm:text-xl font-semibold">45 min</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Focus before fatigue hits.</p>
                </div>
                <div className="glass border rounded-2xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">Weekly retros</p>
                  <p className="text-lg sm:text-xl font-semibold">Sunday</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Adjust lanes with data.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-6 bottom-6 w-px bg-border/80" aria-hidden />
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div key={step.title} className="glass border rounded-2xl p-5 shadow-glow relative">
                    <span className="absolute -left-9 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-background text-xs font-semibold">
                      {idx + 1}
                    </span>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                          <Badge variant="secondary" className="bg-accent/15 text-foreground border-accent/30">
                            {step.meta}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Topics Section */}
        <section className="py-20 lg:py-24 bg-secondary/10 border-y border-border/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center space-y-3">
              <p className="text-sm font-mono uppercase tracking-[0.18em] text-primary">Stacks we cover</p>
              <h2 className="font-display text-3xl md:text-4xl">Everything you need to sound like the team you want to join.</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Languages, frameworks, data, infra, and collaboration -- all mapped to the kinds of questions recruiters actually ask about.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {techGroups.map((group) => (
                <div key={group.title} className="glass border rounded-2xl p-5 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <group.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm text-muted-foreground">Track</p>
                      <h3 className="text-lg font-semibold">{group.title}</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 text-sm rounded-full border border-border/70 bg-background/60 text-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Suspense fallback={<SectionLoader />}>
          <TestimonialSection />
        </Suspense>

        {/* FAQ Section */}
        <section id="faq" className="py-20 lg:py-24 bg-card/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-14 space-y-3">
              <h2 className="text-3xl md:text-4xl font-display">Frequently asked</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about the platform, billing, and access.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full" defaultValue="">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  What makes Leet-prep different from other coding platforms?
                </AccordionTrigger>
                <AccordionContent>
                  Leet-prep provides company-wise organized DSA problems, allowing you to target specific companies like Google,
                  Amazon, or Microsoft. All problems are tagged by difficulty and topic, making focused interview prep easier.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Which companies' interview questions are available?</AccordionTrigger>
                <AccordionContent>
                  We cover 50+ top tech companies including FAANG (Facebook/Meta, Amazon, Apple, Netflix, Google), Microsoft, Adobe,
                  Uber, Airbnb, and many more. New companies are added regularly.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Do you support multiple programming languages?</AccordionTrigger>
                <AccordionContent>
                  Yes! We support all major programming languages including Python, Java, C++, JavaScript, TypeScript, and more.
                  You can solve problems in your preferred language.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Is Leet-prep free?</AccordionTrigger>
                <AccordionContent>
                  Yes, Leet-prep offers a comprehensive free tier with access to 500+ DSA problems. Premium features unlock advanced
                  analytics, exclusive problems, and company-specific interview patterns.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>How do I track my progress?</AccordionTrigger>
                <AccordionContent>
                  Your dashboard shows detailed statistics including problems solved by company, difficulty distribution, topic-wise
                  progress, and streak tracking to keep you motivated.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="relative overflow-hidden glass border shadow-glow rounded-3xl p-10 md:p-14">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
              <div className="relative space-y-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Trusted by 12,000+ learners
                </div>
                <h2 className="text-3xl md:text-5xl font-display leading-tight">
                  Ready to crack your dream company?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join students and professionals who ship confident, senior-quality answers in real interviews.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-primary-foreground bg-primary rounded-xl shadow-glow hover:-translate-y-0.5 transition-transform"
                  >
                    Start free today
                  </Link>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-foreground bg-background/40 border border-border rounded-xl hover:bg-background/60 transition"
                  >
                    Browse problems
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Suspense fallback={<SectionLoader />}>
          <Footer7 />
        </Suspense>
      </div>
    </div>
  );
}
