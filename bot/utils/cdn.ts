import { put } from "@vercel/blob";
import * as fs from "fs";
import * as path from "path";
import logger from "./logger";

export async function uploadImageToCdn(args: { filePath?: string; base64DataUrl?: string }): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for CDN uploads");
  }

  let data: Buffer;
  let fileName = `generated_${Date.now()}.png`;

  if (args.filePath && fs.existsSync(args.filePath)) {
    data = fs.readFileSync(args.filePath);
    fileName = path.basename(args.filePath);
    logger.info("CDN: using file on disk for upload", { fileName });
  } else if (args.base64DataUrl) {
    const base64 = args.base64DataUrl.includes(",")
      ? args.base64DataUrl.split(",")[1]
      : args.base64DataUrl;
    data = Buffer.from(base64, "base64");
    logger.info("CDN: using base64 data for upload");
  } else {
    throw new Error("No image data provided for upload");
  }

  const objectName = `fabel/${Date.now()}-${fileName}`;
  const blob = await put(objectName, data, { access: "public", token });
  logger.info("CDN: uploaded image", { url: blob.url });
  return blob.url;
}

