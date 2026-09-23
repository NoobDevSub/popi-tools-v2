"use client";

import React, { forwardRef } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TimelineContentProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "p" | "article" | "section" | "span" | "h1" | "h2" | "h3" | "ul" | "li";
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLElement | null>;
  customVariants?: Variants | {
    visible?: (i: number) => any;
    hidden?: any;
    [key: string]: any;
  };
  children: React.ReactNode;
}

export const TimelineContent = forwardRef<HTMLElement, TimelineContentProps>(
  (
    {
      as = "div",
      animationNum = 0,
      timelineRef,
      customVariants,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const defaultVariants: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.15,
          duration: 0.5,
          ease: "easeOut",
        },
      }),
    };

    const variants = customVariants || defaultVariants;
    const MotionComponent = (motion as any)[as] || motion.div;

    return (
      <MotionComponent
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        custom={animationNum}
        variants={variants}
        className={cn(className)}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
);

TimelineContent.displayName = "TimelineContent";
