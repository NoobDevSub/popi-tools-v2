"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { LiquidCard, CardContent, CardHeader } from "@/components/ui/liquid-glass-card";
import { Badge } from "@/components/ui/badge";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

// Types and Enums
export enum Strength {
  None = "none",
  Weak = "weak",
  Moderate = "moderate",
  Strong = "strong",
}

export interface FinancialScoreProps {
  title: string;
  description: string;
  initialScore?: number;
}

export interface FinancialScoreButtonProps {
  children?: React.ReactNode;
  isOutlined?: boolean;
  onClick?: () => void;
}

export interface FinancialScoreCardProps {
  children?: React.ReactNode;
}

export interface FinancialScoreDisplayProps {
  value: Score;
  max: number;
}

export interface FinancialScoreHalfCircleProps {
  value: Score;
  max: number;
}

export interface FinancialScoreHeaderProps {
  title?: string;
  strength?: Strength;
}

type CounterContextType = {
  getNextIndex: () => number;
};

type Score = number | null;
type StrengthColors = Record<Strength, string[]>;

// Sample Data
export const defaultFinancialScoreData: FinancialScoreProps[] = [
  {
    title: "Protection Score",
    description:
      "This score measures your overall security strength and drawdown resistance. Higher score indicates optimal analytical discipline.",
    initialScore: 78,
  },
  {
    title: "Investment Score",
    description:
      "This score measures pattern alignment with historical probability distributions. Higher score indicates higher statistical resonance.",
    initialScore: 86,
  },
  {
    title: "Financial Fitness",
    description:
      "Evaluate statistical risk control in real-time. Calculate your analytical fitness score across rolling rounds instantly.",
  },
];

// Utils Class
class Utils {
  static LOCALE = "en-US";

  static easings = {
    easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    easeOut: "cubic-bezier(0.33, 1, 0.68, 1)",
  };

  static circumference(r: number): number {
    return 2 * Math.PI * r;
  }

  static formatNumber(n: number) {
    return new Intl.NumberFormat(this.LOCALE).format(n);
  }

  static getStrength(score: Score, maxScore: number): Strength {
    if (!score) return Strength.None;

    const percent = score / maxScore;

    if (percent >= 0.8) return Strength.Strong;
    if (percent >= 0.4) return Strength.Moderate;

    return Strength.Weak;
  }

  static randomHash(length = 4): string {
    const chars = "abcdef0123456789";
    const bytes = crypto.getRandomValues(new Uint8Array(length));

    return [...bytes].map((b) => chars[b % chars.length]).join("");
  }

  static randomInt(min = 0, max = 1): number {
    const value = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

    return Math.round(min + (max - min) * value);
  }
}

// Context
const CounterContext = createContext<CounterContextType | undefined>(undefined);

const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const counterRef = useRef(0);
  const getNextIndex = useCallback(() => {
    return counterRef.current++;
  }, []);

  return <CounterContext.Provider value={{ getNextIndex }}>{children}</CounterContext.Provider>;
};

const useCounter = () => {
  const context = useContext(CounterContext);

  if (!context) {
    throw new Error("useCounter must be used within a CounterProvider");
  }

  return context.getNextIndex;
};

// Components
export function FinancialScoreButton({ children, isOutlined, onClick }: FinancialScoreButtonProps) {
  return (
    <LiquidButton
      variant={"default"}
      isOutlined={isOutlined}
      onClick={onClick}
      className="w-full h-14 text-sm sm:text-base py-3 animate-in fade-in slide-in-from-bottom-6 duration-700"
    >
      {children}
    </LiquidButton>
  );
}

export function FinancialScoreCard({ children }: FinancialScoreCardProps) {
  const getNextIndex = useCounter();
  const indexRef = useRef<number | null>(null);
  const animationRef = useRef<any>(0);
  const [appearing, setAppearing] = useState(false);

  if (indexRef.current === null) {
    indexRef.current = getNextIndex();
  }

  useEffect(() => {
    const delayInc = 150;
    const delay = 100 + (indexRef.current || 0) * delayInc;

    animationRef.current = setTimeout(() => setAppearing(true), delay);

    return () => {
      clearTimeout(animationRef.current);
    };
  }, []);

  if (!appearing) return null;

  return (
    <LiquidCard className="w-full max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both border border-slate-200/80 dark:border-slate-800/80">
      <CardContent className="p-6 sm:p-8">{children}</CardContent>
    </LiquidCard>
  );
}

export function FinancialScoreDisplay({ value, max }: FinancialScoreDisplayProps) {
  const hasValue = value !== null;
  const digits = String(Math.floor(value!)).split("");
  const maxFormatted = Utils.formatNumber(max);
  const label = hasValue ? `out of ${maxFormatted}` : "No score";

  return (
    <div className="absolute bottom-0 w-full text-center">
      <div className="text-4xl font-extrabold h-14 overflow-hidden relative font-['Orbitron',sans-serif]">
        <div className="absolute inset-0 opacity-0">
          <div className="inline-block">0</div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          {hasValue &&
            digits.map((digit, i) => (
              <span
                key={i}
                className="inline-block animate-in slide-in-from-bottom-full duration-700 fill-mode-both text-slate-900 dark:text-white"
                style={{
                  animationDelay: `${300 + i * 100}ms`,
                  animationDuration: `${700 + i * 200}ms`,
                }}
              >
                {digit}
              </span>
            ))}
        </div>
      </div>
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-['Orbitron',sans-serif]">
        {label}
      </div>
    </div>
  );
}

export function FinancialScoreHalfCircle({ value, max }: FinancialScoreHalfCircleProps) {
  const strokeRef = useRef<SVGCircleElement>(null);
  const gradIdRef = useRef(`grad-${Utils.randomHash()}`);
  const gradId = gradIdRef.current;
  const gradStroke = `url(#${gradId})`;
  const radius = 45;
  const dist = Utils.circumference(radius);
  const distHalf = dist / 2;
  const distFourth = distHalf / 2;
  const strokeDasharray = `${distHalf} ${distHalf}`;
  const distForValue = Math.min((value as number) / max, 1) * -distHalf;
  const strokeDashoffset = value !== null ? distForValue : -distFourth;
  const strength = Utils.getStrength(value, max);

  const strengthColors: StrengthColors = {
    none: ["hsl(220, 13%, 69%)", "hsl(220, 9%, 46%)"],
    weak: ["hsl(0, 84%, 80%)", "hsl(0, 84%, 60%)", "hsl(0, 84%, 40%)"],
    moderate: ["hsl(38, 92%, 80%)", "hsl(38, 92%, 60%)", "hsl(38, 92%, 40%)"],
    strong: ["hsl(142, 71%, 80%)", "hsl(142, 71%, 60%)", "hsl(142, 71%, 40%)"],
  };
  const colorStops = strengthColors[strength];

  useEffect(() => {
    const strokeStart = 300;
    const duration = 1200;

    if (strokeRef.current && typeof strokeRef.current.animate === "function") {
      strokeRef.current.animate(
        [
          { strokeDashoffset: "0", offset: 0 },
          { strokeDashoffset: "0", offset: strokeStart / duration },
          { strokeDashoffset: strokeDashoffset.toString() },
        ],
        {
          duration,
          easing: Utils.easings.easeInOut,
          fill: "forwards",
        }
      );
    }
  }, [value, max, strokeDashoffset]);

  return (
    <svg className="block mx-auto w-auto max-w-full h-36" viewBox="0 0 100 50" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          {colorStops.map((stop, i) => {
            const offset = `${(100 / (colorStops.length - 1)) * i}%`;
            return <stop key={i} offset={offset} stopColor={stop} />;
          })}
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth="10" transform="translate(50, 50.5)">
        <circle className="stroke-slate-200 dark:stroke-slate-800/80" r={radius} />
        <circle
          ref={strokeRef}
          stroke={gradStroke}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function FinancialScoreHeader({ title, strength }: FinancialScoreHeaderProps) {
  const hasStrength = Boolean(strength && strength !== Strength.None);

  const getBadgeVariant = (s?: Strength) => {
    switch (s) {
      case Strength.Weak:
        return "destructive";
      case Strength.Moderate:
        return "secondary";
      case Strength.Strong:
        return "default";
      default:
        return "secondary";
    }
  };

  const getBadgeClassName = (s?: Strength) => {
    switch (s) {
      case Strength.Weak:
        return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30";
      case Strength.Moderate:
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30";
      case Strength.Strong:
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
      default:
        return "";
    }
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between gap-4 pb-6 px-0 animate-in fade-in duration-500">
      <h2 className="text-base sm:text-lg font-bold truncate text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
        {title}
      </h2>
      {hasStrength && (
        <Badge
          variant={getBadgeVariant(strength)}
          className={`uppercase text-[10px] font-extrabold tracking-wider shrink-0 h-7 px-2.5 font-['Orbitron',sans-serif] ${getBadgeClassName(strength)}`}
        >
          {strength}
        </Badge>
      )}
    </CardHeader>
  );
}

export function FinancialScore({ title, description, initialScore }: FinancialScoreProps) {
  const [score, setScore] = useState<Score>(initialScore ?? null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const hasScore = score !== null;
  const max = 100;
  const strength = Utils.getStrength(score, max);

  function handleGenerateScore(): void {
    if (!hasScore) {
      setScore(Utils.randomInt(58, 96));
    } else {
      setIsDetailOpen(!isDetailOpen);
    }
  }

  return (
    <FinancialScoreCard>
      <FinancialScoreHeader title={title} strength={strength} />
      <div className="relative mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <FinancialScoreHalfCircle value={score} max={max} />
        <FinancialScoreDisplay value={score} max={max} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 min-h-[3rem] leading-relaxed">
        {description}
      </p>

      {isDetailOpen && (
        <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 animate-in fade-in duration-300">
          <div className="font-bold text-[#FF4625] font-['Orbitron',sans-serif]">
            Analytical Breakdown
          </div>
          <p>
            Rated {score}/100 based on standard deviation variance and historical momentum continuity across the latest sample windows.
          </p>
        </div>
      )}

      <FinancialScoreButton isOutlined={hasScore} onClick={handleGenerateScore}>
        {hasScore ? (isDetailOpen ? "Hide Details" : "Learn More & Breakdown") : "Calculate Your Score"}
      </FinancialScoreButton>
    </FinancialScoreCard>
  );
}

// Main Component
export function FinancialScoreCards({
  cards = defaultFinancialScoreData,
  className,
}: {
  cards?: FinancialScoreProps[];
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 mx-auto ${className || ""}`}>
      <CounterProvider>
        {cards.map((card, i) => (
          <FinancialScore key={i} {...card} />
        ))}
      </CounterProvider>
    </div>
  );
}

export default FinancialScoreCards;
