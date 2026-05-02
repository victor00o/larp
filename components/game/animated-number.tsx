"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  formatter?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, formatter = (next) => next.toLocaleString(), className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = useState(() => formatter(value));

  useMotionValueEvent(motionValue, "change", (latest) => {
    setDisplay(formatter(Math.round(latest)));
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.8,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [motionValue, value]);

  return <span className={className}>{display}</span>;
}
