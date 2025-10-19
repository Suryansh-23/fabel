import { GoogleGenAI, Modality } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

export interface ImageGenerationResult {
    success: boolean;
    imageUrl?: string;
    imageData?: string; // base64 encoded
    imagePath?: string; // file system path
    error?: string;
}

export class ImageGenerator {
    private client: GoogleGenAI;
    private projectId: string;
    private location: string;

    constructor() {
        this.projectId = process.env.GOOGLE_VERTEX_PROJECT || '';
        this.location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';

        if (!this.projectId) {
            throw new Error('GOOGLE_VERTEX_PROJECT is required for image generation');
        }

        this.client = new GoogleGenAI({
            vertexai: true,
            project: this.projectId,
            location: this.location,
        });
    }

    async generateImage(prompt: string): Promise<ImageGenerationResult> {
        try {
            console.log('Generating image with Google Gemini, prompt:', prompt);

            const response = await this.client.models.generateContentStream({
                model: 'gemini-2.5-flash-image',
                contents: prompt,
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
                },
            });

            let imageData: any = null;
            let textResponse = '';

            for await (const chunk of response) {
                const text = chunk.text;
                const data = chunk.data;

                if (text) {
                    textResponse += text;
                    console.log('Generated text:', text);
                }

                if (data) {
                    // Store the first image data
                    if (!imageData) {
                        imageData = data;
                        console.log('Image data received');
                    }
                }
            }

            if (imageData) {
                // imageData might be a Buffer or a base64 string
                let base64Image: string;
                let imageBuffer: Buffer;

                if (Buffer.isBuffer(imageData)) {
                    // If it's already a Buffer, convert to base64
                    base64Image = imageData.toString('base64');
                    imageBuffer = imageData;
                } else if (typeof imageData === 'string') {
                    // If it's a base64 string, use it directly
                    base64Image = imageData;
                    imageBuffer = Buffer.from(imageData, 'base64');
                } else {
                    // Unknown format, try to convert
                    base64Image = String(imageData);
                    imageBuffer = Buffer.from(base64Image, 'base64');
                }

                const imageDataUrl = `data:image/png;base64,${base64Image}`;

                // Save to output folder
                const timestamp = Date.now();
                const outputDir = path.join(__dirname, '../output');
                const fileName = `generated_image_${timestamp}.png`;
                const filePath = path.join(outputDir, fileName);

                try {
                    // Ensure output directory exists
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }

                    // Write binary image data to file
                    fs.writeFileSync(filePath, imageBuffer);
                    console.log(`Image saved to: ${filePath}`);

                    return {
                        success: true,
                        imageData: base64Image,
                        imageUrl: imageDataUrl,
                        imagePath: filePath,
                    };
                } catch (saveError) {
                    console.error('Error saving image file:', saveError);
                    // Still return success with image data even if file save fails
                    return {
                        success: true,
                        imageData: base64Image,
                        imageUrl: imageDataUrl,
                    };
                }
            }

            return {
                success: false,
                error: 'No image data returned from API. Text response: ' + textResponse,
            };
        } catch (error) {
            console.error('Error generating image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
}
