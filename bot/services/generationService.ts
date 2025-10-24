import logger from "../utils/logger";
import { imagine, OutputType } from "@fabel/sdk";
import type { InputContext } from "@fabel/sdk";

export interface GenSuccessImage {
  ok: true;
  type: "image";
  imagePath?: string;
  imageDataUrl?: string;
}

export interface GenFallbackText {
  ok: true;
  type: "text";
  text: string;
}

export interface GenFailure {
  ok: false;
  error: string;
}

export type GenerationResult = GenSuccessImage | GenFallbackText | GenFailure;

export async function generateFromContext(
  ic: InputContext
): Promise<GenerationResult> {
  try {
    logger.info("Generation: imagine() start", { entries: ic.context.length });
    const output = await imagine(ic);
    logger.info("Generation: imagine() done", { type: output.outputType });

    if (
      output.outputType === OutputType.Image &&
      (output.image || output.text)
    ) {
      // SDK returns image path or data url in output.image
      const val = output.image;
      if (val?.startsWith("/")) {
        return { ok: true, type: "image", imagePath: val };
      }
      if (val?.startsWith("data:image")) {
        return { ok: true, type: "image", imageDataUrl: val };
      }
      // Treat unknown string as path
      return { ok: true, type: "image", imagePath: val };
    }

    // Fallback to a safe minimal message. Avoid leaking internal prompts.
    const fallback =
      "Unable to generate an image for this request. Please try again with a clearer visual prompt or include an image.";
    return { ok: true, type: "text", text: fallback };
  } catch (err: any) {
    logger.error("Generation failed", { error: err?.message });
    return { ok: false, error: err?.message || "Generation error" };
  }
}
