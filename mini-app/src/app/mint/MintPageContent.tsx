"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Button } from "~/components/ui/Button";
import { Address, Hex, decodeEventLog, parseAbi } from "viem";
import { ExternalLink } from "lucide-react";
import sdk from "@farcaster/miniapp-sdk";

const ABI = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  // Public mint variants
  "function mint(string uri) external returns (uint256)",
  "function mint(string) external",
  // Fallbacks (if contract allows callers to mint to themselves)
  "function safeMint(address to, string uri) external",
  "function mintTo(address to, string uri) external returns (uint256)",
]);

function basescanBase(chainId: number) {
  return chainId === 84532
    ? "https://sepolia.basescan.org"
    : "https://basescan.org";
}

export default function MintPageContent() {
  const search = useSearchParams()!;
  const router = useRouter();

  const img = search.get("img") || undefined;
  const name = search.get("name") || undefined;
  const description = search.get("description") || undefined;
  const contractFromQuery = search.get("contract") || undefined;

  const targetChainId = useMemo(
    () =>
      parseInt(
        process.env.NEXT_PUBLIC_NFT_CHAIN_ID ?? String(baseSepolia.id),
        10
      ),
    []
  );
  const contractAddress = (contractFromQuery ||
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS) as Address | undefined;

  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const [txHash, setTxHash] = useState<Hex | undefined>();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  useEffect(() => {
    if (isConfirmed && receipt) {
      // Try to extract tokenId from Transfer event logs
      let tokenId: bigint | undefined;
      try {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "Transfer") {
              const args = decoded.args as unknown as {
                from: Address;
                to: Address;
                tokenId: bigint;
              };
              if (
                address &&
                (args.to as string).toLowerCase() ===
                  (address as string).toLowerCase()
              ) {
                tokenId = args.tokenId;
                break;
              }
            }
          } catch {}
        }
      } catch {}

      const successUrl = new URL("/mint/success", window.location.origin);
      if (contractAddress)
        successUrl.searchParams.set("contract", contractAddress);
      if (tokenId !== undefined)
        successUrl.searchParams.set("tokenId", tokenId.toString());
      if (txHash) successUrl.searchParams.set("tx", txHash);
      successUrl.searchParams.set("chainId", String(targetChainId));
      if (img) successUrl.searchParams.set("img", img);
      router.replace(successUrl.toString());
    }
  }, [
    isConfirmed,
    receipt,
    address,
    contractAddress,
    img,
    router,
    targetChainId,
    txHash,
  ]);

  const canMint = Boolean(img && contractAddress);

  async function handleMint() {
    if (!img) return;
    if (!contractAddress) return;

    // Ensure we're connected to the Farcaster wallet connector (index 0 in our provider)
    if (!isConnected) {
      try {
        const farcasterConnector = connectors?.[0];
        if (farcasterConnector)
          await connect({ connector: farcasterConnector });
      } catch (_e) {
        console.error("Connect failed", _e);
        return;
      }
    }

    // Ensure correct chain (Base Sepolia by default)
    if (chainId !== targetChainId) {
      try {
        await switchChain({ chainId: targetChainId });
      } catch (_e) {
        console.error("Switch chain failed", _e);
        return;
      }
    }

    // Build tokenURI from our metadata endpoint
    const metadataUrl = new URL("/api/metadata", window.location.origin);
    metadataUrl.searchParams.set("img", img);
    if (name) metadataUrl.searchParams.set("name", name);
    if (description) metadataUrl.searchParams.set("description", description);

    // Try public mint variants first
    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: ABI,
        functionName: "mint",
        args: [metadataUrl.toString()],
      });
      setTxHash(hash);
      return;
    } catch {
      // Fallback to safeMint/mintTo if contract allows self-minting
    }

    try {
      const to = address as Address;
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: ABI,
        functionName: "safeMint",
        args: [to, metadataUrl.toString()],
      });
      setTxHash(hash);
      return;
    } catch {
      // Final fallback
    }

    try {
      const to = address as Address;
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: ABI,
        functionName: "mintTo",
        args: [to, metadataUrl.toString()],
      });
      setTxHash(hash);
    } catch (_e) {
      console.error("Mint failed", _e);
    }
  }

  const disabled =
    !canMint || isConnecting || isSwitching || isWriting || isConfirming;

  const txUrl = useMemo(
    () => (txHash ? `${basescanBase(targetChainId)}/tx/${txHash}` : undefined),
    [txHash, targetChainId]
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-dark-900">
      <div className="w-full max-w-md">
        {/* Header with Fabel Branding */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl shadow-fabel-purple/25">
              <Image
                src="/logo.png"
                alt="Fabel Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">fabel</h1>
              <p className="text-sm text-gray-400">Making Fabels</p>
            </div>
          </div>
          <div className="glass rounded-full px-3 py-1.5">
            <span className="text-xs font-medium text-white">
              {targetChainId === 84532 ? "Base Sepolia" : "Base"}
            </span>
          </div>
        </div>

        {/* Enhanced Image Preview */}
        {img ? (
          <div className="mb-8 relative group">
            {/* Gradient border effect */}
            <div className="absolute -inset-1 bg-fabel-gradient rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative polaroid">
              <div className="polaroid-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt="NFT Preview"
                  className="object-cover w-full h-full"
                />
              </div>
              {/* Preview badge */}
              <div className="absolute top-2 right-2 glass rounded-full px-2 py-1">
                <span className="text-xs font-medium text-white">Preview</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-8 glass rounded-2xl text-center">
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
            <p className="text-red-400 font-medium">Missing Image URL</p>
            <p className="text-gray-500 text-sm mt-1">Add ?img=... parameter</p>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleMint}
            disabled={disabled}
            isLoading={isWriting || isConfirming}
            className="w-full h-14 text-base font-semibold btn-primary"
          >
            {isConfirming ? (
              <div className="flex items-center gap-2">
                <div className="spinner-primary w-5 h-5"></div>
                Confirming Transaction...
              </div>
            ) : isWriting ? (
              <div className="flex items-center gap-2">
                <div className="spinner-primary w-5 h-5"></div>
                Minting NFT...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Mint NFT
              </div>
            )}
          </Button>

          {txUrl && (
            <a
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary w-full h-12 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Transaction
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
