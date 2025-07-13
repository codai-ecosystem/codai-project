import * as React from "react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ className, message, children, ...props }, ref) => {
    const content = message || children;

    if (!content) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center space-x-2 text-sm text-destructive",
          className
        )}
        {...props}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span>{content}</span>
      </div>
    );
  }
);
ErrorMessage.displayName = "ErrorMessage";

export { ErrorMessage };
