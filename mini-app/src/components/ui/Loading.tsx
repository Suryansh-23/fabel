import React from "react";
import Image from "next/image";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "gradient" | "white";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "primary",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const variantClasses = {
    primary: "border-fabel-purple/30 border-t-fabel-purple",
    gradient: "border-transparent bg-fabel-gradient",
    white: "border-white/30 border-t-white",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {variant === "gradient" ? (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-fabel-gradient animate-spin"></div>
          <div className="absolute inset-1 rounded-full bg-dark-900"></div>
        </div>
      ) : (
        <div
          className={`animate-spin rounded-full border-2 ${variantClasses[variant]} ${sizeClasses[size]}`}
        ></div>
      )}
    </div>
  );
}

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export function LoadingScreen({
  message = "Loading...",
  showLogo = true,
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-dark-900">
      <div className="text-center">
        {showLogo && (
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto bg-fabel-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-fabel-purple/25 animate-glow p-3">
              <Image
                src="/logo.png"
                alt="Fabel Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gradient mt-4">fabel</h1>
          </div>
        )}

        <LoadingSpinner size="lg" variant="gradient" className="mx-auto mb-6" />

        <p className="text-gray-400 text-lg font-medium">{message}</p>
        <p className="text-gray-600 text-sm mt-2">
          Please wait while we prepare everything
        </p>
      </div>
    </div>
  );
}
