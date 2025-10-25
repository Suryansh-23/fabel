"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";

function baseScanUrl(chainId: number) {
  return chainId === 84532
    ? "https://sepolia.basescan.org"
    : "https://basescan.org";
}

export default function MintSuccessPage({
  searchParams,
}: {
  searchParams: {
    contract?: string;
    tokenId?: string;
    tx?: string;
    chainId?: string;
    img?: string;
  };
}) {
  const contract = searchParams.contract as `0x${string}` | undefined;
  const tokenId = searchParams.tokenId;
  const tx = searchParams.tx as `0x${string}` | undefined;
  const chainId = Number(searchParams.chainId ?? "8453");
  const img = searchParams.img;

  const { tokenUrl, txUrl } = useMemo(() => {
    const baseUrl = baseScanUrl(chainId);
    return {
      tokenUrl:
        contract && tokenId
          ? `${baseUrl}/token/${contract}?a=${tokenId}`
          : undefined,
      txUrl: tx ? `${baseUrl}/tx/${tx}` : undefined,
    };
  }, [contract, tokenId, tx, chainId]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-dark-900 relative overflow-hidden">
      {/* Celebration Background Effects */}
      <div className="absolute inset-0 bg-dark-mesh"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-fabel-purple/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-fabel-blue/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Success Header */}
        <div className="text-center mb-8">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-4 bg-fabel-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-fabel-purple/25 animate-glow p-4">
            <Image
              src="/logo.png"
              alt="Fabel Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Mint Complete!</h1>
          <p className="text-gray-400">Your NFT was successfully minted</p>

          <div className="mt-4 glass rounded-full px-4 py-2 inline-block">
            <span className="text-xs font-medium text-white">
              {Number(searchParams.chainId) === 84532 ? "Base Sepolia" : "Base"}
            </span>
          </div>
        </div>

        {/* NFT Display */}
        {img && (
          <div className="mb-8 relative group">
            {/* Celebration glow effect */}
            <div className="absolute -inset-2 bg-fabel-gradient rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
            <div className="relative">
              <div className="polaroid">
                <div className="polaroid-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt="Your Minted NFT"
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Success badge */}
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full px-3 py-1">
                  <span className="text-xs font-bold">MINTED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NFT Details */}
        {contract && tokenId && (
          <div className="mb-6 glass rounded-xl p-4 space-y-3">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                NFT Details
              </h3>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Contract
              </label>
              <p className="text-xs font-mono text-gray-300 break-all bg-dark-800 rounded-lg px-3 py-2">
                {contract}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Token ID
              </label>
              <p className="text-sm font-mono text-white bg-dark-800 rounded-lg px-3 py-2">
                #{tokenId}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {tokenUrl && (
            <Link
              href={tokenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full h-12 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View on BaseScan
            </Link>
          )}

          {txUrl && (
            <Link
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary w-full h-12 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              View Transaction
            </Link>
          )}

          {/* Share Button */}
          <button className="btn btn-outline w-full h-12 flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            Share NFT
          </button>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">🎉 Congratulations!</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your NFT is now live on the blockchain and stored in your Farcaster
            wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
