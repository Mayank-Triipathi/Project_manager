// src/components/ui/card.jsx
import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Card = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export { Card };
