import * as React from "react";
import { cn } from "@/lib/utils";

const FieldGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    />
  );
});
FieldGroup.displayName = "FieldGroup";

const Field = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    />
  );
});
Field.displayName = "Field";

const FieldLabel = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

const FieldSeparator = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative flex items-center py-2", className)}
      {...props}
    >
      <div className="flex-1 border-t border-border" />
      {children && (
        <span className="px-2 text-xs text-muted-foreground">{children}</span>
      )}
      <div className="flex-1 border-t border-border" />
    </div>
  );
});
FieldSeparator.displayName = "FieldSeparator";

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldSeparator };
