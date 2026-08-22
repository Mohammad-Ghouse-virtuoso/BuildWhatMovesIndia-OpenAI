import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm";
}

export function Button({
  asChild = false,
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-700 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-civic-900 text-white hover:bg-civic-800",
        variant === "secondary" &&
          "border border-civic-200 bg-white text-civic-900 hover:bg-civic-50",
        variant === "ghost" && "text-civic-700 hover:bg-civic-50",
        size === "default" ? "h-11 px-5 text-sm" : "h-9 px-4 text-sm",
        className,
      )}
      {...props}
    />
  );
}
