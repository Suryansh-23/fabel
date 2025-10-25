import React from "react";

interface StatusBadgeProps {
  status: "connected" | "disconnected" | "connecting" | "error";
  label?: string;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  className = "",
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "connected":
        return {
          color: "bg-green-500",
          text: "text-green-400",
          bg: "bg-green-500/20",
          label: label || "Connected",
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "connecting":
        return {
          color: "bg-yellow-500",
          text: "text-yellow-400",
          bg: "bg-yellow-500/20",
          label: label || "Connecting...",
          icon: (
            <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          ),
        };
      case "error":
        return {
          color: "bg-red-500",
          text: "text-red-400",
          bg: "bg-red-500/20",
          label: label || "Error",
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      default:
        return {
          color: "bg-gray-500",
          text: "text-gray-400",
          bg: "bg-gray-500/20",
          label: label || "Disconnected",
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${className}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${config.color} ${
          status === "connecting" ? "animate-pulse" : ""
        }`}
      ></div>
      <div className="flex items-center gap-1.5">
        {config.icon}
        <span className={`text-xs font-medium ${config.text}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

interface ChainBadgeProps {
  chainId: number;
  className?: string;
}

export function ChainBadge({ chainId, className = "" }: ChainBadgeProps) {
  const getChainConfig = (id: number) => {
    switch (id) {
      case 1:
        return {
          name: "Ethereum",
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        };
      case 8453:
        return {
          name: "Base",
          color: "bg-blue-600/20 text-blue-300 border-blue-600/30",
        };
      case 84532:
        return {
          name: "Base Sepolia",
          color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        };
      default:
        return {
          name: `Chain ${id}`,
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        };
    }
  };

  const config = getChainConfig(chainId);

  return (
    <div
      className={`glass border rounded-full px-3 py-1.5 ${config.color} ${className}`}
    >
      <span className="text-xs font-medium">{config.name}</span>
    </div>
  );
}
