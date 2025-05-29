import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  fallbackSrc?: string;
  fallbackClassName?: string;
  containerClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder.png",
  className,
  fallbackClassName,
  containerClassName,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!error ? (
        <Image
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
          {...props}
        />
      ) : (
        <Image
          src={fallbackSrc}
          alt={`Fallback for ${alt}`}
          className={cn(className, fallbackClassName)}
          {...props}
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}