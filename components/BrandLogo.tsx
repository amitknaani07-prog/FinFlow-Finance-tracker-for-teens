"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
}

export default function BrandLogo({ className, size = "md", showGlow = true }: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-2xl md:text-3xl",
    md: "text-4xl md:text-5xl",
    lg: "text-6xl md:text-7xl",
    xl: "text-7xl md:text-8xl",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn("relative group cursor-default select-none", className)}
    >
      {showGlow && (
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 group-hover:bg-accent/30 transition-all duration-700 opacity-50" />
      )}
      <h1 className={cn(
        "relative z-10 font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-transform duration-500 group-hover:scale-[1.03]",
        sizeClasses[size]
      )}>
        FinFlow
      </h1>
    </motion.div>
  );
}
