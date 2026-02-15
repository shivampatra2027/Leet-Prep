import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Thin wrapper progress bar styled like shadcn/ui
 */
const Progress = React.forwardRef(({ className, value = 0, max = 100, ...props }, ref) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
