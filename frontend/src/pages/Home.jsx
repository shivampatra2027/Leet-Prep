import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TestimonialSection } from "@/components/TestimonialSection"
import { Feature } from "@/components/Feature"
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
import { Footer7 } from "@/components/Footer";

const HeroSection = () => {
  return (
    <section className='flex min-h-[calc(100dvh-4rem)] flex-1 flex-col justify-between gap-12 overflow-x-hidden pt-8 sm:gap-16 sm:pt-16 lg:gap-24 lg:pt-24'>
      {/* Hero Content */}
      <div className='mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8'>
        <div className='bg-muted flex items-center gap-2.5 rounded-full border px-3 py-2'>
          <Badge>AI-Powered</Badge>
          <span className='text-muted-foreground'>Solution for client-facing businesses</span>
        </div>

        <h1 className='text-3xl leading-[1.29167] font-bold text-balance sm:text-4xl lg:text-5xl'>
          Sizzling Summer Delights
          <br />
          <span className='relative'>
            Effortless
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
          Recipes for Parties!
        </h1>

        <p className='text-muted-foreground'>
          Dive into a world of flavor this summer with our collection of Sizzling Summer Delights!
          <br />
          From refreshing appetizers to delightful desserts
        </p>

        <Button size='lg' asChild>
          <a href='#'>Try It Now</a>
        </Button>
      </div>

      {/* Image */}
      <img
        src='https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/hero/image-19.png'
        alt='Dishes'
        className='min-h-67 w-full object-cover'
      />
    </section>
  )
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
        <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <Feature />

      {/* Steps Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Get started quickly <br/>
                <span className="text-primary">in just 3 simple steps</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                A fast and frustration-free way to set up and start your preparation journey.
              </p>

              <div className="space-y-8">
                {[
                  { step: "1", title: "Create an account", desc: "Set up in seconds with your university email." },
                  { step: "2", title: "Pick a track", desc: "Choose from Data Structures, Algorithms, or SQL." },
                  { step: "3", title: "Start coding", desc: "Solve problems and get instant feedback." }
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
      <section id="topics" className="pt-24 pb-32 relative bg-background">
        <div className="container mx-auto px-4 lg:px-16">
          <div className="text-center">
            <p className="text-sm md:text-base font-mono tracking-tight text-center">
              <span className="text-primary font-medium">import</span> techstack <span className="text-primary">from</span> "../leetcode"
            </p>
            <p className="text-3xl md:text-4xl font-mono font-semibold mt-8 text-center text-foreground">
              <span className="italic font-light">leet</span><span className="text-primary font-light animate-pulse">_</span> stack
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
      <TestimonialSection />

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about the platform.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is Leet.IO free to use?</AccordionTrigger>
              <AccordionContent>
                Yes, Leet.IO offers a free tier with access to a wide range of problems. We also have a premium subscription for advanced features and exclusive content.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I use Leet.IO for interview preparation?</AccordionTrigger>
              <AccordionContent>
                Absolutely! Leet.IO is designed specifically to help you prepare for technical interviews with curated problem sets and company-specific questions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Do you support multiple programming languages?</AccordionTrigger>
              <AccordionContent>
                Yes, we support all major programming languages including Python, Java, C++, JavaScript, and more.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How often are new problems added?</AccordionTrigger>
              <AccordionContent>
                We add new problems weekly to keep our content fresh and aligned with the latest interview trends.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-primary-foreground relative overflow-hidden border">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
              Ready to explore Leet.IO experience?
            </h2>
            <p className="text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto relative z-10">
              Discover tips, resources, and guidance to maximize experience with our platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-primary bg-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-xl"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-primary-foreground bg-primary/20 border border-primary-foreground/20 rounded-xl hover:bg-primary/30 transition-all"
              >
                View Problems
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                  L
                </div>
                <span className="text-xl font-bold text-slate-900">Leet.IO</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                The best platform for KIIT students to prepare for coding interviews. Built with ❤️ by students, for students.
              </p>
              <div className="flex gap-4">
                {["twitter", "github", "linkedin", "discord"].map((social) => (
                  <a key={social} href="#" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                    <span className="sr-only">{social}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85v2.74c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Community</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Discussions</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Discord Server</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contributing</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© 2025 Leet.IO. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-900">Privacy</a>
              <a href="#" className="hover:text-slate-900">Terms</a>
              <a href="#" className="hover:text-slate-900">Sitemap</a>
            </div>
          </div>
        </div>
      </footer> */}
      <Footer7 />
    </div>
  );
}