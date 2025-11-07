"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Workflow, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface DockButton {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

export default function Dock() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const buttons: DockButton[] = [
    {
      id: "agent",
      icon: Bot,
      label: "Agent",
      onClick: () => {
        console.log("Agent clicked");
        // Add your agent logic here
      },
    },
    {
      id: "workflow",
      icon: Workflow,
      label: "Workflow",
      onClick: () => {
        console.log("Workflow clicked");
        // Add your workflow logic here
      },
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      onClick: () => {
        console.log("Settings clicked");
        // Add your settings logic here
      },
    },
  ];

  // Handle keyboard shortcut (Alt+D / Cmd+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== "undefined" && window.electronAPI?.platform === "darwin";
      const modifier = isMac ? e.metaKey : e.altKey;
      
      if (modifier && e.key === "d") {
        e.preventDefault();
        if (window.electronAPI) {
          window.electronAPI.toggleVisibility();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Glass morphism effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5" />
        
        <div className="relative flex items-center gap-3">
          {buttons.map((button, index) => {
            const Icon = button.icon;
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.button
                key={button.id}
                onClick={button.onClick}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "w-12 h-12 rounded-xl",
                  "transition-all duration-200",
                  "hover:bg-white/10 active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Hover effect background */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      layoutId="hoverBackground"
                      className="absolute inset-0 rounded-xl bg-white/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <Icon
                  className={cn(
                    "w-5 h-5 text-white/90 transition-colors duration-200",
                    isHovered && "text-white"
                  )}
                />

                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.9 }}
                      className="absolute -top-10 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm text-white text-xs font-medium whitespace-nowrap pointer-events-none"
                    >
                      {button.label}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-black/80" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-50 -z-10" />
    </motion.div>
  );
}
