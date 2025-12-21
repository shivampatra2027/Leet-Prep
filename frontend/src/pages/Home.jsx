import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Code, 
  FileCode, 
  FileCode2, 
  Coffee, 
  Binary, 
  Layers, 
  Atom, 
  Server, 
  Database, 
  DatabaseZap, 
  Flame, 
  Figma, 
  Palette, 
  Sparkles, 
  Cloud, 
  CloudCog, 
  GitBranch 
} from "lucide-react"
import Navbar from "@/components/Navbar";

// Lazy load components below the fold
const TestimonialSection = lazy(() => import("@/components/TestimonialSection").then(module => ({ default: module.TestimonialSection })));
const Feature = lazy(() => import("@/components/Feature").then(module => ({ default: module.Feature })));
const Footer7 = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer7 })));

// Loading fallback component
const SectionLoader = () => (
  <div className="w-full py-24 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const HeroSection = () => {
  return (
    <section className='flex min-h-[80vh] flex-1 flex-col justify-between gap-8 overflow-x-hidden pt-6 sm:gap-12 sm:pt-12 lg:gap-16 lg:pt-16'>
      {/* Hero Content */}
      <div className='mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8'>
        <div className='bg-muted flex items-center gap-2.5 rounded-full border px-3 py-2'>
          <Badge>Company-Wise</Badge>
          <span className='text-muted-foreground'>Curated DSA problems from top tech companies</span>
        </div>

        <h1 className='text-3xl leading-[1.29167] font-bold text-balance sm:text-4xl lg:text-5xl'>
          Master Data Structures & Algorithms
          <br />
          <span className='relative'>
            Company-Wise
            <svg
              width='223'
              height='12'
              viewBox='0 0 223 12'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='absolute inset-x-0 bottom-0 w-full translate-y-1/2 max-sm:hidden'
            >
              <path
                d='M1.11716 10.428C39.7835 4.97282 75.9074 2.70494 114.894 1.98894C143.706 1.45983 175.684 0.313587 204.212 3.31596C209.925 3.60546 215.144 4.59884 221.535 5.74551'
                stroke='url(#paint0_linear_10365_68643)'
                strokeWidth='2'
                strokeLinecap='round'
              />
              <defs>
                <linearGradient
                  id='paint0_linear_10365_68643'
                  x1='18.8541'
                  y1='3.72033'
                  x2='42.6487'
                  y2='66.6308'
                  gradientUnits='userSpaceOnUse'
                >
                  <stop stopColor='var(--primary)' />
                  <stop offset='1' stopColor='var(--primary-foreground)' />
                </linearGradient>
              </defs>
            </svg>
          </span>{' '}
          Coding Problems!
        </h1>

        <p className='text-muted-foreground text-lg'>
          Practice 1800+ DSA problems organized by top companies like Google, Amazon, Microsoft & more.
          <br />
          Ace your technical interviews with targeted preparation.
        </p>

        <Button size='lg' asChild>
          <Link to='/dashboard'>Start Practicing Now</Link>
        </Button>
      </div>

      {/* Image */}
      <picture>
        <source 
          srcSet='https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop&auto=format&fm=webp&q=70 800w,
                  https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop&auto=format&fm=webp&q=70 1200w'
          sizes='(max-width: 768px) 800px, 1200px'
          type='image/webp'
        />
        <img
          src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop&auto=format&q=70'
          alt='Coding and programming workspace with multiple monitors displaying code'
          className='min-h-67 w-full object-cover'
          loading='eager'
          fetchPriority='high'
          width='1200'
          height='600'
          decoding='async'
        />
      </picture>
    </section>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
        <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <Suspense fallback={<SectionLoader />}>
        <Feature />
      </Suspense>

      {/* Steps Section */}
      <section className="py-16 md:py-24 bg-muted/30" style={{ contentVisibility: 'auto' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Your Interview Prep Journey <br/>
                <span className="text-primary">starts in 3 simple steps</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Start solving company-specific DSA problems and land your dream job at top tech companies.
              </p>

              <div className="space-y-8">
                {[
                  { step: "1", title: "Sign up for free", desc: "Create your account with KIIT email and get instant access." },
                  { step: "2", title: "Choose your target company", desc: "Filter problems by Google, Amazon, Microsoft, Meta & 50+ companies." },
                  { step: "3", title: "Solve & Track Progress", desc: "Practice DSA problems, write code, and monitor your improvement." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-purple-500/30 rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative bg-card rounded-2xl shadow-2xl border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-32 bg-muted rounded-lg"></div>
                    <div className="h-8 w-8 bg-primary/20 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-muted/50 rounded"></div>
                    <div className="h-4 w-5/6 bg-muted/50 rounded"></div>
                    <div className="h-4 w-4/6 bg-muted/50 rounded"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="h-24 bg-primary/10 rounded-xl border border-primary/20"></div>
                    <div className="h-24 bg-muted/50 rounded-xl border"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section id="topics" className="pt-16 md:pt-24 pb-24 md:pb-32 relative bg-background" style={{ contentVisibility: 'auto' }}>
        <div className="container mx-auto px-4 lg:px-16">
          <div className="text-center">
            <p className="text-sm md:text-base font-mono tracking-tight text-center">
              <span className="text-primary font-medium">import</span> languages <span className="text-primary">from</span> "@leet.io/compiler"
            </p>
            <p className="text-3xl md:text-4xl font-mono font-semibold mt-8 text-center text-foreground">
              Supported <span className="text-primary font-light">Programming</span> Languages
            </p>
          </div>

          <div className="mt-16">
            <div className="mx-auto text-center mb-8">
              <svg className="mx-auto h-24 text-primary opacity-50" viewBox="0 0 100 50" fill="currentColor">
                <path d="M50 5 L50 35 M45 30 L50 35 L55 30" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            
            <div className="flex flex-wrap mt-8 gap-16 md:gap-24 justify-center w-fit mx-auto p-2 lowercase tracking-wide">
              <div>
                <ul className="font-mono text-sm space-y-4 mt-4 text-muted-foreground">
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Code className="w-5 h-5" />
                    <span>Python</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <FileCode className="w-5 h-5" />
                    <span>JavaScript</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <FileCode2 className="w-5 h-5" />
                    <span>TypeScript</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Coffee className="w-5 h-5" />
                    <span>Java</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Binary className="w-5 h-5" />
                    <span>C++</span>
                  </a></li>
                </ul>
              </div>
              
              <div>
                <ul className="font-mono space-y-4 text-sm mt-4 text-muted-foreground">
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Layers className="w-5 h-5" />
                    <span>NextJS</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Atom className="w-5 h-5" />
                    <span>React JS</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Server className="w-5 h-5" />
                    <span>Django</span>
                  </a></li>
                </ul>
              </div>

              <div>
                <ul className="font-mono space-y-4 mt-4 text-muted-foreground text-sm">
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Database className="w-5 h-5" />
                    <span>MongoDB</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <DatabaseZap className="w-5 h-5" />
                    <span>PostgreSQL</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Flame className="w-5 h-5" />
                    <span>Firebase</span>
                  </a></li>
                </ul>
              </div>

              <div>
                <ul className="font-mono space-y-4 mt-4 text-muted-foreground text-sm">
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Figma className="w-5 h-5" />
                    <span>Figma</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Palette className="w-5 h-5" />
                    <span>Design</span>
                  </a></li>
                  <li><a className="flex gap-2 items-center hover:text-primary transition-colors" href="/dashboard">
                    <Sparkles className="w-5 h-5" />
                    <span>UI/UX</span>
                  </a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="max-w-5xl w-full pt-6 bg-card border mx-auto mt-20 rounded-xl overflow-hidden relative">
            <p className="text-center text-sm text-muted-foreground font-mono font-medium">[ CLOUD & VERSION CONTROL ]</p>
            <div className="flex flex-wrap pb-8 md:pb-6 items-center gap-10 lg:gap-16 justify-center mt-10">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Cloud className="w-12 h-12" />
                <span className="font-mono text-sm">AWS</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <CloudCog className="w-12 h-12" />
                <span className="font-mono text-sm">Google Cloud</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <GitBranch className="w-12 h-12" />
                <span className="font-mono text-sm">Git</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Suspense fallback={<SectionLoader />}>
        <TestimonialSection />
      </Suspense>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-muted/30" style={{ contentVisibility: 'auto' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about the platform.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="">
            <AccordionItem value="item-1">
              <AccordionTrigger>What makes Leet.IO different from other coding platforms?</AccordionTrigger>
              <AccordionContent>
                Leet.IO provides company-wise organized DSA problems, allowing you to target specific companies like Google, Amazon, or Microsoft. All problems are tagged by difficulty and topic, making focused interview prep easier.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Which companies' interview questions are available?</AccordionTrigger>
              <AccordionContent>
                We cover 50+ top tech companies including FAANG (Facebook/Meta, Amazon, Apple, Netflix, Google), Microsoft, Adobe, Uber, Airbnb, and many Indian startups. New companies are added regularly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Do you support multiple programming languages?</AccordionTrigger>
              <AccordionContent>
                Yes! We support all major programming languages including Python, Java, C++, JavaScript, TypeScript, and more. You can solve problems in your preferred language.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Is Leet.IO free for KIIT students?</AccordionTrigger>
              <AccordionContent>
                Yes, Leet.IO offers a comprehensive free tier with access to 500+ DSA problems. Premium features unlock advanced analytics, exclusive problems, and company-specific interview patterns.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I track my progress?</AccordionTrigger>
              <AccordionContent>
                Your dashboard shows detailed statistics including problems solved by company, difficulty distribution, topic-wise progress, and streak tracking to keep you motivated.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background" style={{ contentVisibility: 'auto' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-primary-foreground relative overflow-hidden border">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
              Ready to Crack Your Dream Company?
            </h2>
            <p className="text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of students who've landed offers at Google, Amazon, Microsoft, and more using Leet.IO.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link 
                to="/signup" 
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-primary bg-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-xl"
              >
                Start Free Today
              </Link>
              <Link 
                to="/dashboard" 
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-primary-foreground bg-primary/20 border border-primary-foreground/20 rounded-xl hover:bg-primary/30 transition-all"
              >
                Browse 500+ Problems
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Suspense fallback={<SectionLoader />}>
        <Footer7 />
      </Suspense>
    </div>
  );
}