import logger from "../utils/logger";
import type { InputContext, UserMsg } from "@fabel/sdk";

interface BuildArgs {
  mentionCast: any;
  parentCast?: any;
  parentImages: string[]; // up to 2
  includePfp: boolean;
}

function buildUserMsgFromCast(cast: any, media?: string, overrideMsg?: string): UserMsg {
  const handle: string = cast?.author?.username || "user";
  const username: string = cast?.author?.display_name || cast?.author?.username || "User";
  const msg: string = overrideMsg ?? (cast?.text || "");
  return { handle, username, msg, media };
}

export function buildInputContext(args: BuildArgs): InputContext {
  const { mentionCast, parentCast, parentImages, includePfp } = args;

  const context: { depth: number; userMsg: UserMsg }[] = [];
  let depth = 0;

  // Optional PFP context
  if (includePfp) {
    const pfp = mentionCast?.author?.pfp_url;
    if (pfp && typeof pfp === "string") {
      context.push({
        depth: depth++,
        userMsg: {
          handle: mentionCast?.author?.username || "user",
          username: mentionCast?.author?.display_name || mentionCast?.author?.username || "User",
          msg: "User profile image",
          media: pfp,
        },
      });
      logger.info("InputBuilder: included PFP", { url: pfp });
    } else {
      logger.info("InputBuilder: PFP requested but not available");
    }
  }

  // Parent cast context (if available)
  if (parentCast) {
    const parentText = (parentCast?.text || "").slice(0, 800);
    if (parentText) {
      context.push({ depth: depth++, userMsg: buildUserMsgFromCast(parentCast, undefined, parentText) });
    }

    if (parentImages.length > 0) {
      // Add first image with an "image from parent" message
      context.push({
        depth: depth++,
        userMsg: buildUserMsgFromCast(parentCast, parentImages[0], "Image from parent cast"),
      });
    }
    if (parentImages.length > 1) {
      // Add second image as additional
      context.push({
        depth: depth++,
        userMsg: buildUserMsgFromCast(parentCast, parentImages[1], "Additional image from parent cast"),
      });
    }
  }

  // Mention cast (always final, text only to drive intent)
  const mentionText = (mentionCast?.text || "").slice(0, 800);
  context.push({ depth: depth++, userMsg: buildUserMsgFromCast(mentionCast, undefined, mentionText) });

  const ic: InputContext = { context };
  logger.info("InputBuilder: built InputContext", { entries: context.length });
  return ic;
}

export function shouldIncludePfp(mentionText: string): boolean {
  const regex = /\b(me|my|pfp)\b/i;
  return regex.test(mentionText || "");
}
