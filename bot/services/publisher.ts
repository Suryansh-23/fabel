import neynarClient from "../utils/neynarClient";
import logger from "../utils/logger";

interface PublishImageArgs {
  signerUuid: string;
  parentHash: string;
  imageUrl: string;
  idemKey: string;
}

interface PublishTextArgs {
  signerUuid: string;
  parentHash: string;
  text: string;
  idemKey: string;
}

export async function publishImageReply(args: PublishImageArgs) {
  const { signerUuid, parentHash, imageUrl, idemKey } = args;
  logger.info("Publishing image reply", { parentHash, imageUrl });
  const reply = await neynarClient.publishCast({
    signerUuid,
    text: "",
    embeds: [{ url: imageUrl } as any],
    parent: parentHash,
    idem: idemKey,
  });
  logger.info("Published image reply", { replyHash: reply.cast?.hash });
  return reply;
}

export async function publishTextReply(args: PublishTextArgs) {
  const { signerUuid, parentHash, text, idemKey } = args;
  logger.info("Publishing text reply", { parentHash });
  const reply = await neynarClient.publishCast({
    signerUuid,
    text,
    parent: parentHash,
    idem: idemKey,
  });
  logger.info("Published text reply", { replyHash: reply.cast?.hash });
  return reply;
}

