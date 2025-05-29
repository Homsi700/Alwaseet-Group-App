import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  className?: string;
}

export function LoadingState({
  text = "جاري التحميل...",
  size = "md",
  fullPage = false,
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2",
      fullPage ? "min-h-[50vh]" : "py-8",
      className
    )}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  return content;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-4",
      className
    )}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  error?: Error | string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "حدث خطأ",
  error,
  retry,
  className,
}: ErrorStateProps) {
  const errorMessage = error 
    ? typeof error === "string" 
      ? error 
      : error.message || "حدث خطأ غير متوقع"
    : "حدث خطأ أثناء تحميل البيانات";

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-4",
      className
    )}>
      <div className="mb-4 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        {errorMessage}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}