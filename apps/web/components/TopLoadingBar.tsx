"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function TopLoadingBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const completionRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount to avoid showing on first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear any existing timers
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
    if (completionRef.current) {
      clearTimeout(completionRef.current);
    }

    // Show loading bar immediately
    setIsVisible(true);
    setProgress(10);

    // Simulate loading progress
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return prev;
        }
        // Increase progress with decreasing increments
        const increment = Math.max(1, (90 - prev) * 0.15);
        return Math.min(90, prev + increment);
      });
    }, 30);

    // Complete loading after route change completes
    completionRef.current = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
    }, 300);

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
      if (completionRef.current) {
        clearTimeout(completionRef.current);
      }
    };
  }, [pathname]);

  // Handle page reload
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Show loading bar on page reload
    const handleBeforeUnload = () => {
      setIsVisible(true);
      setProgress(20);
    };

    const handleLoad = () => {
      // Small delay to show completion
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, 200);
      }, 100);
    };

    // Show loading on page reload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Handle page load completion
    if (document.readyState === "complete") {
      // Check if this is a page reload (navigation type 1 = reload)
      const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigationEntry?.type === "reload") {
        setIsVisible(true);
        setProgress(30);
        handleLoad();
      }
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  // Intercept link clicks to show loading bar immediately
  useEffect(() => {
    if (typeof window === "undefined") return;

    const startProgress = () => {
      // Clear any existing timers
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
      if (completionRef.current) {
        clearTimeout(completionRef.current);
      }

      setIsVisible(true);
      setProgress(10);

      // Start progress animation
      progressRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return prev;
          }
          const increment = Math.max(1, (90 - prev) * 0.15);
          return Math.min(90, prev + increment);
        });
      }, 30);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href) {
        try {
          const url = new URL(link.href);
          const currentUrl = new URL(window.location.href);

          // Only show loading bar for same-origin navigation
          if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
            startProgress();
          }
        } catch (error) {
          // Invalid URL, ignore
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[1px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 dark:from-orange-400 dark:via-orange-300 dark:to-orange-400 transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: progress > 0
            ? "0 0 8px hsl(20 90% 45% / 0.6), 0 0 4px hsl(20 90% 45% / 0.4)"
            : "none",
        }}
      />
    </div>
  );
}

