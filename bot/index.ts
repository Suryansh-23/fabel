import "dotenv/config";
import express from "express";
import { globalIdempotency } from "./queue/idempotency";
import { globalJobQueue } from "./queue/jobQueue";
import { extractContextFromWebhook } from "./services/contextExtractor";
import { generateFromContext } from "./services/generationService";
import {
  buildInputContext,
  shouldIncludePfp,
} from "./services/inputContextBuilder";
import { publishImageReply, publishTextReply } from "./services/publisher";
import { uploadImageToCdn } from "./utils/cdn";
import logger from "./utils/logger";
import { loadEnv } from "./utils/env";

// Validate environment before accepting any requests
const ENV = loadEnv();

const app = express();
const port = ENV.PORT;
const signer = ENV.SIGNER_UUID;

// Middleware
app.use(express.text());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "fabel-bot",
  });
});

app.post("/", async (req, res) => {
  const hookData = req.body;
  const mentionHash = hookData?.data?.hash;
  const parentHash = hookData?.data?.parent_hash ?? null;
  const authorFid = hookData?.data?.author?.fid;
  logger.info("Webhook: received cast.created", {
    mentionHash,
    parentHash,
    authorFid,
  });

  // Always ack immediately
  res.json({ ok: true, received: true, mentionHash });

  if (!mentionHash) {
    logger.warn("Webhook: missing mention hash, aborting");
    return;
  }

  const idState = globalIdempotency.get(mentionHash);
  if (
    idState &&
    (idState.status === "in_progress" || idState.status === "done")
  ) {
    logger.info("Idempotency: already processing or done, skipping", {
      mentionHash,
      status: idState.status,
    });
    return;
  }
  globalIdempotency.set(mentionHash, "queued");

  globalJobQueue.enqueue(mentionHash, async () => {
    globalIdempotency.set(mentionHash, "in_progress");
    try {
      logger.info("Job start", { mentionHash, parentHash });

      // 1) Extract context
      const { parentCast, parentImages } = await extractContextFromWebhook(
        hookData
      );

      // 2) Determine PFP rule
      const includePfp = shouldIncludePfp(hookData?.data?.text || "");

      // 3) Build InputContext
      const inputContext = buildInputContext({
        mentionCast: hookData.data,
        parentCast,
        parentImages,
        includePfp,
      });

      // 4) Generate via SDK imagine
      const gen = await generateFromContext(inputContext);
      if (!gen.ok) {
        logger.error("Generation failed", { mentionHash, error: gen.error });
        await publishTextReply({
          signerUuid: signer!,
          parentHash: mentionHash,
          text: "Sorry, I couldn't generate an image right now.",
          idemKey: mentionHash,
        });
        globalIdempotency.set(mentionHash, "failed");
        return;
      }

      if (gen.type === "image") {
        // 5) Upload to CDN
        const imageUrl = await uploadImageToCdn({
          filePath: gen.imagePath,
          base64DataUrl: gen.imageDataUrl,
        });

        // 6) Publish plain image embed reply
        await publishImageReply({
          signerUuid: signer!,
          parentHash: mentionHash,
          imageUrl,
          idemKey: mentionHash,
        });
        globalIdempotency.set(mentionHash, "done");
        logger.info("Job complete (image)", { mentionHash, imageUrl });
        return;
      }

      // Fallback: publish text reply (skip image)
      await publishTextReply({
        signerUuid: signer!,
        parentHash: mentionHash,
        text: gen.text,
        idemKey: mentionHash,
      });
      globalIdempotency.set(mentionHash, "done");
      logger.info("Job complete (text fallback)", { mentionHash });
    } catch (e: any) {
      logger.error("Job error", { mentionHash, error: e?.message });
      globalIdempotency.set(mentionHash, "failed");
    }
  });
});

app.listen(port, () => {
  logger.info(`🚀 Server is running on http://localhost:${port}`);
  logger.info(`📝 Environment: ${ENV.NODE_ENV}`);
  logger.info("Queue configured", { concurrency: 5, maxSize: 15 });
});
