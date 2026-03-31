"use client";

import { Home, PlusCircle, PieChart, Target, Globe, BarChart3, BookOpen, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide nav on auth and onboarding
  if (pathname === "/" || pathname === "/auth" || pathname === "/onboarding") return null;

  const navItems = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Income", icon: PlusCircle, href: "/income" },
    { label: "Spend", icon: PieChart, href: "/expenses" },
    { label: "Goals", icon: Target, href: "/goals" },
    { label: "Learn", icon: BookOpen, href: "/learn" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 md:hidden">
      <div className="glass-card flex justify-between items-center px-4 py-3 rounded-[32px] border border-white/10 shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 p-2 transition-all duration-300",
                isActive ? "text-accent" : "text-textMuted hover:text-white"
              )}
            >
              <item.icon
                className={cn("h-5 w-5 z-10 transition-transform duration-300", isActive && "scale-110")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn("text-[8px] font-black tracking-wider uppercase", isActive ? "text-accent" : "text-textMuted/60")}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute inset-0 bg-accent/15 blur-md rounded-full -z-0" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
