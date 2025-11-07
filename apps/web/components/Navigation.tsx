"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@aura/design-system";
import { LayoutDashboard, Workflow, Bot, Plug, Settings, Sparkles } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/workflows", label: "Workflows", icon: Workflow },
    { href: "/agents", label: "Agents", icon: Bot },
    { href: "/plugins", label: "Plugins", icon: Plug },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="relative">
        {/* Transparent blurry background with subtle orange tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950/30 via-orange-950/20 to-orange-950/30 dark:from-orange-950/40 dark:via-orange-950/30 dark:to-orange-950/40 backdrop-blur-xl backdrop-saturate-200" />

        {/* Subtle border with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

        {/* Content */}
        <div className="relative container mx-auto flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/30 blur-2xl group-hover:bg-orange-500/40 transition-all duration-300 rounded-full" />
                <Sparkles className="relative h-5 w-5 sm:h-6 sm:w-6 text-orange-500 dark:text-orange-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 drop-shadow-lg" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 dark:from-orange-400 dark:via-orange-300 dark:to-orange-400 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:via-orange-300 group-hover:to-orange-400 dark:group-hover:from-orange-300 dark:group-hover:via-orange-200 dark:group-hover:to-orange-300 transition-all duration-300 drop-shadow-sm">
                AURA
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <ul className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
