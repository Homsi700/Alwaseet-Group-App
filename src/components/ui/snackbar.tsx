import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const snackbarVariants = cva(
  "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm p-4 rounded-lg shadow-lg border flex items-center gap-3 transition-all duration-300 transform",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success: "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
        error: "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
        warning: "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
        info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
      },
      state: {
        open: "translate-y-0 opacity-100",
        closed: "translate-y-10 opacity-0 pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "closed",
    },
  }
);

export interface SnackbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof snackbarVariants> {
  open?: boolean;
  onClose?: () => void;
  autoHideDuration?: number;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  hideCloseButton?: boolean;
}

const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(
  (
    {
      className,
      variant,
      state,
      open = false,
      onClose,
      autoHideDuration = 5000,
      icon,
      action,
      hideCloseButton = false,
      children,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(open);

    React.useEffect(() => {
      setIsOpen(open);
    }, [open]);

    React.useEffect(() => {
      if (isOpen && autoHideDuration && onClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    }, [isOpen, autoHideDuration, onClose]);

    return (
      <div
        ref={ref}
        className={cn(
          snackbarVariants({
            variant,
            state: isOpen ? "open" : "closed",
          }),
          className
        )}
        role="alert"
        {...props}
      >
        {icon && <div className="shrink-0">{icon}</div>}
        <div className="flex-1">{children}</div>
        {action && <div className="shrink-0">{action}</div>}
        {!hideCloseButton && onClose && (
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-1 transition-colors hover:bg-muted/20"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Snackbar.displayName = "Snackbar";

export { Snackbar };