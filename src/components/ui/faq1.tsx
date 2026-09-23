"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "What is POPI Tools?",
    answer:
      "POPI Tools is a gaming-focused AI companion and toolkit designed to give players useful tools, experiences, and AI-powered assistance in one place.",
  },
  {
    question: "How do I get started with POPI?",
    answer: (
      <span>
        Getting started is simple. Download POPI from{" "}
        <a
          href="https://play.google.com/store/apps/details?id=com.popi.popitools.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#FF4625] underline decoration-orange-300 hover:decoration-[#FF4625] transition-colors"
        >
          Google Play
        </a>
        , install the app, sign in with your Google account, connect your Telegram
        account, and join the{" "}
        <a
          href="https://t.me/popitools"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#0284C7] underline decoration-sky-300 hover:decoration-[#0284C7] transition-colors"
        >
          official POPI Telegram channel
        </a>{" "}
        to complete the access requirements.
      </span>
    ),
  },
  {
    question: "Is POPI Tools free to use?",
    answer:
      "POPI Tools provides a free experience with access to selected features and tools. Some advanced or premium functionality may have additional requirements or availability.",
  },
  {
    question: "Do I need a Google account to use POPI?",
    answer:
      "Yes. POPI uses Google sign-in for account authentication so you can securely access your POPI account and continue using the app.",
  },
  {
    question: "Why does POPI require Telegram?",
    answer:
      "Telegram is used as part of the POPI community and access system. Connecting Telegram helps POPI verify your community connection and gives you access to the official POPI community.",
  },
  {
    question: "Do I need to join the POPI Telegram channel?",
    answer: (
      <span>
        Yes. Joining the{" "}
        <a
          href="https://t.me/popitools"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#0284C7] underline decoration-sky-300 hover:decoration-[#0284C7] transition-colors"
        >
          official POPI Telegram channel
        </a>{" "}
        is part of the access requirements for POPI. It also keeps you connected
        with POPI updates, announcements, and community information.
      </span>
    ),
  },
  {
    question: "Where can I download POPI?",
    answer: (
      <span>
        You can download POPI directly from{" "}
        <a
          href="https://play.google.com/store/apps/details?id=com.popi.popitools.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#FF4625] underline decoration-orange-300 hover:decoration-[#FF4625] transition-colors"
        >
          Google Play
        </a>
        . Always use the official POPI download link to make sure you are
        installing the correct application.
      </span>
    ),
  },
  {
    question: "Is POPI available on iPhone?",
    answer:
      "POPI's current primary mobile experience is designed for Android. Availability on other platforms may change as POPI continues to develop.",
  },
  {
    question: "Does POPI guarantee gaming results or winnings?",
    answer:
      "No. POPI does not guarantee winnings, profits, or specific gaming results. Any predictions, suggestions, or AI-generated information should be treated as informational and users should make their own decisions.",
  },
  {
    question: "How can I get help with POPI?",
    answer: (
      <span>
        For help, updates, and community support, join the{" "}
        <a
          href="https://t.me/popitools"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#0284C7] underline decoration-sky-300 hover:decoration-[#0284C7] transition-colors"
        >
          official POPI Telegram channel
        </a>
        . You can also use the available POPI feedback or bug-reporting channels
        when reporting an issue.
      </span>
    ),
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="w-full bg-white dark:bg-slate-950 transition-colors">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold tracking-wider uppercase text-[#FF4625] dark:text-orange-400">
            FAQ
          </p>

          <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk',sans-serif]">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Everything you need to know about POPI Tools, getting started,
            access, and using the POPI experience.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="w-full"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-slate-200 dark:border-slate-800"
            >
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-slate-900 dark:text-white py-4 sm:py-5 hover:text-[#FF4625] dark:hover:text-orange-400 transition-colors">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed pb-5 pt-1">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
export { FAQSection };
