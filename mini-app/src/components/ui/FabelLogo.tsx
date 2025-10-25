import React from "react";
import Image from "next/image";

interface FabelLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function FabelLogo({
  size = "md",
  showText = true,
  className = "",
}: FabelLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Fabel Logo Icon */}
      <div className={`${sizeClasses[size]} relative`}>
        <div className="relative bg-dark-900 rounded-lg p-1 flex items-center justify-center w-full h-full overflow-hidden">
          <Image
            src="/logo.png"
            alt="Fabel Logo"
            width={100}
            height={100}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      {/* Fabel Text */}
      {showText && (
        <span className={`font-bold text-gradient ${textSizeClasses[size]}`}>
          fabel
        </span>
      )}
    </div>
  );
}
