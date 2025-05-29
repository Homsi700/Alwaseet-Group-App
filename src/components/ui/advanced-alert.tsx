import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-300 [&>svg]:text-green-500",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 dark:text-yellow-300 [&>svg]:text-yellow-500",
        info:
          "border-blue-500/50 text-blue-700 dark:border-blue-500 dark:text-blue-300 [&>svg]:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AdvancedAlertProps extends VariantProps<typeof alertVariants> {
  title?: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  autoHideDuration?: number;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function AdvancedAlert({
  variant = "default",
  title,
  description,
  icon,
  action,
  dismissible = false,
  onDismiss,
  autoHideDuration,
  className,
  titleClassName,
  descriptionClassName,
}: AdvancedAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  // إخفاء التنبيه تلقائياً بعد مدة محددة
  useEffect(() => {
    if (autoHideDuration && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, isVisible, onDismiss]);

  // إخفاء التنبيه عند النقر على زر الإغلاق
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  // عدم عرض التنبيه إذا كان مخفياً
  if (!isVisible) {
    return null;
  }

  // تحديد الأيقونة المناسبة حسب نوع التنبيه
  const getDefaultIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Alert
      variant={variant}
      className={cn(
        "flex items-start justify-between",
        dismissible && "pr-10 rtl:pl-10 rtl:pr-4",
        className
      )}
    >
      {icon || getDefaultIcon()}
      <div className="flex-1">
        {title && (
          <AlertTitle className={titleClassName}>{title}</AlertTitle>
        )}
        <AlertDescription className={descriptionClassName}>
          {description}
        </AlertDescription>
      </div>
      {action && <div className="ml-4 rtl:mr-4 rtl:ml-0 shrink-0">{action}</div>}
      {dismissible && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 rtl:left-1 rtl:right-auto h-7 w-7 rounded-full p-0"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">إغلاق</span>
        </Button>
      )}
    </Alert>
  );
}

// مكون لعرض تنبيهات متعددة
interface AlertsProviderProps {
  children: React.ReactNode;
}

interface AlertOptions extends Omit<AdvancedAlertProps, 'description'> {
  id?: string;
  description: string;
}

interface AlertsContextType {
  alerts: AlertOptions[];
  addAlert: (alert: AlertOptions) => string;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

const AlertsContext = React.createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: AlertsProviderProps) {
  const [alerts, setAlerts] = useState<AlertOptions[]>([]);

  const addAlert = (alert: AlertOptions) => {
    const id = alert.id || Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { ...alert, id }]);
    return id;
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertsContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2">
        {alerts.map((alert) => (
          <AdvancedAlert
            key={alert.id}
            {...alert}
            onDismiss={() => removeAlert(alert.id!)}
            className="shadow-lg"
          />
        ))}
      </div>
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = React.useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}