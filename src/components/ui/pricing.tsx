"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { Briefcase, CheckCheck, Database, Server } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

export interface PricingPlanItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  currency?: string;
  currencySymbol?: string;
  buttonText: string;
  buttonVariant: "outline" | "default";
  popular?: boolean;
  features?: { text: string; icon: React.ReactNode }[];
  includes: string[];
}

const defaultPlans: PricingPlanItem[] = [
  {
    name: "Starter",
    description:
      "Great for small businesses and startups looking to get started with AI",
    price: 12,
    yearlyPrice: 99,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    features: [
      { text: "Up to 10 boards per workspace", icon: <Briefcase size={20} /> },
      { text: "Up to 10GB storage", icon: <Database size={20} /> },
      { text: "Limited analytics", icon: <Server size={20} /> },
    ],
    includes: [
      "Free includes:",
      "Unlimted Cards",
      "Custom background & stickers",
      "2-factor authentication",
      "Up to 2 individual users",
      "Up to 2 workspaces",
    ],
  },
  {
    name: "Business",
    description:
      "Best value for growing businesses that need more advanced features",
    price: 48,
    yearlyPrice: 399,
    buttonText: "Get started",
    buttonVariant: "default" as const,
    popular: true,
    features: [
      { text: "Unlimted boards", icon: <Briefcase size={20} /> },
      { text: "Storage (250MB/file)", icon: <Database size={20} /> },
      { text: "100 workspace command runs", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Starter, plus:",
      "Advanced checklists",
      "Custom fields",
      "Servedless functions",
      "Up to 10 individual users",
      "Up to 10 workspaces",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Advanced plan with enhanced security and unlimited access for large teams",
    price: 96,
    yearlyPrice: 899,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    features: [
      { text: "Unlimited board", icon: <Briefcase size={20} /> },
      { text: "Unlimited storage ", icon: <Database size={20} /> },
      { text: "Unlimited workspaces", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Business, plus:",
      "Multi-board management",
      "Multi-board guest",
      "Attachment permissions",
      "Custom roles",
      "Custom boards",
    ],
  },
];

export const PricingSwitch = ({
  onSwitch,
  className,
  isYearly = false,
}: {
  onSwitch: (value: string) => void;
  className?: string;
  isYearly?: boolean;
}) => {
  const [selected, setSelected] = useState(isYearly ? "1" : "0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-neutral-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-1">
        <button
          type="button"
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "0"
              ? "text-white"
              : "text-muted-foreground hover:text-black dark:hover:text-white",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl bg-[#FF4625]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly Billing</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "1"
              ? "text-white"
              : "text-muted-foreground hover:text-black dark:hover:text-white",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl bg-[#FF4625]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly Billing
            <span className="rounded-full bg-orange-100 dark:bg-orange-950 px-2 py-0.5 text-xs font-semibold text-orange-900 dark:text-orange-200">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  customPlans?: PricingPlanItem[];
  currencySymbol?: string;
  currencyCode?: string;
  onSelectPlan?: (plan: PricingPlanItem, isYearly: boolean) => void;
  onSecondaryAction?: (plan: PricingPlanItem, isYearly: boolean) => void;
  secondaryButtonText?: string;
  activePlanName?: string;
  className?: string;
}

export default function PricingSection5({
  title = "We've got a plan that's perfect for you",
  subtitle = "Trusted by millions, We help teams all around the world, Explore which option is right for you.",
  customPlans,
  currencySymbol = "$",
  currencyCode = "USD",
  onSelectPlan,
  onSecondaryAction,
  secondaryButtonText,
  activePlanName,
  className,
}: PricingSectionProps = {}) {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const displayPlans = customPlans || defaultPlans;

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value, 10) === 1);

  return (
    <div
      className={cn("px-4 pt-12 pb-16 min-h-screen max-w-7xl mx-auto relative", className)}
      ref={pricingRef}
    >
      <article className="text-left mb-6 space-y-4 max-w-2xl">
        <h2 className="md:text-6xl text-4xl capitalize font-medium text-gray-900 dark:text-white mb-4">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-start"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0, // First element
            }}
          >
            {title}
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="md:text-base text-sm text-gray-600 dark:text-slate-300 w-[80%]"
        >
          {subtitle}
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} className="w-fit" isYearly={isYearly} />
        </TimelineContent>
      </article>

      <div className="grid md:grid-cols-3 gap-4 py-6">
        {displayPlans.map((plan, index) => {
          const isActive = activePlanName && activePlanName.toLowerCase() === plan.name.toLowerCase();
          const currSymbol = plan.currencySymbol || currencySymbol;
          const currCode = plan.currency || currencyCode;

          return (
            <TimelineContent
              key={plan.name}
              as="div"
              animationNum={2 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <Card
                className={`relative border transition-all duration-200 ${
                  plan.popular
                    ? "ring-2 ring-orange-500 bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                    : "bg-white dark:bg-slate-900 border-neutral-200 dark:border-slate-800"
                }`}
              >
                <CardHeader className="text-left">
                  <div className="flex justify-between items-start">
                    <h3 className="xl:text-3xl md:text-2xl text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.name} Plan
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <span className="bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                          Active
                        </span>
                      )}
                      {plan.popular && (
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="xl:text-sm md:text-xs text-sm text-gray-600 dark:text-slate-400 mb-4 min-h-[38px]">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-semibold text-gray-900 dark:text-white">
                      {currSymbol}
                      <NumberFlow
                        format={{
                          currency: currCode,
                        }}
                        value={isYearly ? plan.yearlyPrice : plan.price}
                        className="text-4xl font-semibold inline-block ml-0.5"
                      />
                    </span>
                    <span className="text-gray-600 dark:text-slate-400 ml-1">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <button
                    type="button"
                    onClick={() => onSelectPlan && onSelectPlan(plan, isYearly)}
                    className={`w-full mb-4 p-3.5 text-base font-bold rounded-xl cursor-pointer transition-colors ${
                      plan.popular
                        ? "bg-[#FF4625] hover:bg-[#E03A1B] text-white border border-[#FF4625]"
                        : plan.buttonVariant === "outline"
                          ? "bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700"
                          : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-900"
                    }`}
                  >
                    {isActive ? "Current Active Plan" : plan.buttonText}
                  </button>

                  {secondaryButtonText && onSecondaryAction && (
                    <button
                      type="button"
                      onClick={() => onSecondaryAction(plan, isYearly)}
                      className="w-full mb-6 p-3 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-all"
                    >
                      {secondaryButtonText}
                    </button>
                  )}

                  <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-slate-800">
                    <h2 className="text-xl font-semibold uppercase text-gray-900 dark:text-white mb-3">
                      Features
                    </h2>
                    {plan.includes && plan.includes.length > 0 && (
                      <>
                        <h4 className="font-medium text-base text-gray-900 dark:text-slate-200 mb-3">
                          {plan.includes[0]}
                        </h4>
                        <ul className="space-y-2 font-semibold">
                          {plan.includes.slice(1).map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center">
                              <span className="h-6 w-6 bg-white dark:bg-slate-800 border border-orange-500 rounded-full grid place-content-center mt-0.5 mr-3 shrink-0">
                                <CheckCheck className="h-4 w-4 text-orange-500" />
                              </span>
                              <span className="text-sm text-gray-600 dark:text-slate-400">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TimelineContent>
          );
        })}
      </div>
    </div>
  );
}
