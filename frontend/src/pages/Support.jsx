import React, { useState } from "react";
import { Mail, MessageCircle, HelpCircle, BookOpen, Copy, Check } from "lucide-react";
import { Footer7 } from "@/components/Footer";
import Navbar from "@/components/Navbar";

function CopyEmailButton({ email }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${email}`}
      className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

const faqs = [
  {
    question: "How do I reset my progress?",
    answer:
      "You can reset your progress from your Profile page under 'Account Settings'. This will clear all solved/bookmarked problem states.",
  },
  {
    question: "My payment was deducted but premium wasn't activated. What do I do?",
    answer:
      "Please wait a few minutes and refresh the page. If the issue persists, email us at soulintrovert0@gmail.com or spworld60@gmail.com with your payment screenshot and registered email.",
  },
  {
    question: "Will i be charged after the trial period?",
    answer:
      "No, there are no subscriptions, you will be charged once only when you click the 'Buy Premium' button. We do not auto-renew or charge without explicit action from your side.",
  },
  {
    question: "The site is not loading problems correctly. What should I do?",
    answer:
      "Try clearing your browser cache or switching to incognito mode. If the issue continues, please report it at above emails with a screenshot.",
  },
  {
    question: "Can I use Leet-Prep on mobile?",
    answer:
      "Yes! Leet-Prep is fully responsive and works on all modern mobile browsers.",
  },
  {
    question: "How do I report a bug or request a feature?",
    answer:
      "Send us an at above emails describing the bug or feature request. We review all submissions.",
  },
];

export default function Support() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* <Navbar /> */}

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <HelpCircle className="h-4 w-4" />
              Support Center
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              How can we help you?
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Browse FAQs or reach out directly. We're here to make your interview prep smooth.
            </p>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Email Support</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For general queries, billing issues, or feedback — drop us an email and we'll get back within few hours.
            </p>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center">
                <a
                  href="mailto:soulintrovert0@gmail.com"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  soulintrovert0@gmail.com
                </a>
                <CopyEmailButton email="soulintrovert0@gmail.com" />
              </div>
              <div className="flex items-center">
                <a
                  href="mailto:spworld60@gmail.com"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  spworld60@gmail.com
                </a>
                <CopyEmailButton email="spworld60@gmail.com" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card/70 p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Community Forum</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join discussions, ask questions, and share strategies with thousands of learners preparing for top tech companies.
            </p>
            <a
              href="/dashboard"
              className="text-sm font-medium text-primary hover:underline mt-1"
            >
              Go to Dashboard →
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border bg-card/60 p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Still have questions?</p>
            <p className="font-medium text-foreground mb-3">We're just an email away.</p>
            <a
              href="mailto:soulintrovert0@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 transition-transform"
            >
              <Mail className="h-4 w-4" />
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <Footer7 />
    </div>
  );
}
