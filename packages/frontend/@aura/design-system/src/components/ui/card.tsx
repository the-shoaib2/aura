import * as React from "react";

import { cn } from "../../utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative overflow-hidden rounded-xl border-2 border-orange-200/15 dark:border-orange-900/20",
      "bg-gradient-to-br from-card/95 via-card to-card/98",
      "dark:from-card/95 dark:via-card/92 dark:to-card/98",
      "backdrop-blur-md backdrop-saturate-150",
      "shadow-lg shadow-orange-500/10 dark:shadow-orange-900/20",
      "hover:shadow-2xl hover:shadow-orange-500/15 dark:hover:shadow-orange-900/30",
      "hover:border-orange-300/25 dark:hover:border-orange-800/30",
      "transition-all duration-300 ease-out",
      "before:absolute before:inset-0 before:rounded-xl",
      "before:bg-gradient-to-br before:from-orange-500/0 before:via-orange-500/0 before:to-orange-500/0",
      "hover:before:from-orange-500/8 hover:before:via-orange-500/5 hover:before:to-orange-500/8",
      "before:transition-all before:duration-300",
      "text-card-foreground",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-10 flex flex-col space-y-1.5 p-5 sm:p-6",
      "border-b border-orange-100/10 dark:border-orange-900/20",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-tight tracking-tight",
      "text-foreground group-hover:text-primary/90",
      "transition-colors duration-200",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      "leading-relaxed",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-10 p-5 sm:p-6 pt-4 sm:pt-5",
      "text-card-foreground",
      className
    )}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-10 flex items-center p-5 sm:p-6 pt-4 sm:pt-5",
      "border-t border-orange-100/10 dark:border-orange-900/20",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

