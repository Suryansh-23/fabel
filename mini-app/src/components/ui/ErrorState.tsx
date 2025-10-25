import React from "react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  actionLabel = "Try Again",
  onAction,
  showRetry = true,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`text-center p-8 ${className}`}>
      {/* Error Icon */}
      <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 leading-relaxed">{message}</p>

      {showRetry && (
        <Button onClick={onAction} variant="outline" className="mx-auto">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface NetworkErrorProps {
  chainId?: number;
  expectedChainId?: number;
  onSwitchNetwork?: () => void;
}

export function NetworkError({
  chainId,
  expectedChainId = 84532,
  onSwitchNetwork,
}: NetworkErrorProps) {
  const getNetworkName = (id: number) => {
    switch (id) {
      case 1:
        return "Ethereum Mainnet";
      case 8453:
        return "Base";
      case 84532:
        return "Base Sepolia";
      default:
        return `Chain ${id}`;
    }
  };

  return (
    <div className="glass rounded-2xl p-6 text-center border-red-500/30">
      <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">Wrong Network</h3>
      <p className="text-gray-400 text-sm mb-4">
        {chainId ? (
          <>
            Currently on {getNetworkName(chainId)}. Please switch to{" "}
            {getNetworkName(expectedChainId)}
          </>
        ) : (
          <>Please connect to {getNetworkName(expectedChainId)}</>
        )}
      </p>

      {onSwitchNetwork && (
        <Button onClick={onSwitchNetwork} variant="primary" size="sm">
          Switch Network
        </Button>
      )}
    </div>
  );
}
