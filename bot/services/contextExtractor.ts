import neynarClient from "../utils/neynarClient";
import logger from "../utils/logger";

export interface ExtractedContext {
  parentCast?: any;
  parentImages: string[]; // up to two image URLs
}

function isLikelyImageUrl(url: string): boolean {
  return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp|\.svg)(\?.*)?$/i.test(url);
}

export async function extractContextFromWebhook(hookData: any): Promise<ExtractedContext> {
  const mention = hookData?.data;
  const parentHash: string | null = mention?.parent_hash ?? null;

  logger.info("ContextExtractor: start", {
    mentionHash: mention?.hash,
    parentHash,
  });

  let parentCast: any | undefined;
  const parentImages: string[] = [];

  if (parentHash) {
    try {
      const res = await neynarClient.lookupCastByHashOrUrl({
        identifier: parentHash,
        type: "hash" as any,
      });
      parentCast = res.cast;
      logger.info("Fetched parent cast", {
        parentHash,
        authorFid: parentCast?.author?.fid,
        embedsCount: parentCast?.embeds?.length ?? 0,
      });

      const embeds: any[] = parentCast?.embeds ?? [];
      for (const e of embeds) {
        // Only consider URL embeds
        const url: string | undefined = (e && typeof e.url === "string") ? e.url : undefined;
        if (!url) continue;
        const contentType: string | null | undefined = e.metadata?.content_type;
        const hasImageMeta = Boolean(e.metadata?.image);
        if ((contentType && contentType.startsWith("image")) || hasImageMeta || isLikelyImageUrl(url)) {
          parentImages.push(url);
        }
        if (parentImages.length >= 2) break;
      }

      logger.info("Extracted images from parent", { count: parentImages.length, images: parentImages });
    } catch (err: any) {
      logger.error("Failed to fetch parent cast", { parentHash, error: err?.message });
    }
  } else {
    logger.info("No parent cast found (root post)");
  }

  return { parentCast, parentImages };
}

