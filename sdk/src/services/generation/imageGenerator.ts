import { GoogleGenAI, Modality } from '@google/genai';
import axios from 'axios';

export interface ImageGenerationResult {
    success: boolean;
    imageUrl?: string; // data URL (data:image/png;base64,...)
    imageData?: string; // base64 encoded (raw)
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


        console.log(`The project Id: ${this.projectId} & location : ${this.location}`)
        this.client = new GoogleGenAI({
            vertexai: true,
            project: this.projectId,
            location: this.location,
        });
    }

    async generateImage(prompt: string, imageUrl?: string): Promise<ImageGenerationResult> {
        try {
            console.log('Generating image with Google Gemini, prompt:', prompt);
            if (imageUrl) {
                console.log('Reference image URL:', imageUrl);
            }

            // Prepare the contents array for multimodal request
            let contents: any;

            if (imageUrl) {
                // Check if the URL is a blob URL (browser-specific, cannot be fetched from Node.js)
                if (imageUrl.startsWith('blob:')) {
                    console.warn('⚠️  Blob URL detected:', imageUrl);
                    console.warn('⚠️  Blob URLs are browser-specific memory references and cannot be accessed from Node.js server.');
                    console.warn('⚠️  Skipping reference image. Please provide an HTTP/HTTPS URL or base64 data instead.');
                    // Continue without reference image
                    contents = prompt;
                } else {
                    // Fetch the image from URL and convert to base64
                    console.log('Fetching reference image from URL...');
                    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                    const imageBase64 = Buffer.from(imageResponse.data, 'binary').toString('base64');

                // Determine MIME type from response headers or URL extension
                    const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
                    console.log('Reference image fetched, MIME type:', contentType);

                    // Construct multimodal contents with both text and image
                    contents = [
                        {
                            role: 'user',
                            parts: [
                                { text: prompt }, // The text prompt
                                {
                                    inlineData: { // The reference image
                                        mimeType: contentType,
                                        data: imageBase64
                                    }
                                }
                            ]
                        }
                    ];
                }
            } else {
                // Text-only prompt
                contents = prompt;
            }

            const response = await this.client.models.generateContentStream({
                model: 'gemini-2.5-flash-image',
                contents: contents,
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
                    // console.log('Generated text:', text);
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
                // let imageBuffer: Buffer;

                if (Buffer.isBuffer(imageData)) {
                    // If it's already a Buffer, convert to base64
                    base64Image = imageData.toString('base64');
                    // imageBuffer = imageData;
                } else if (typeof imageData === 'string') {
                    // If it's a base64 string, use it directly
                    base64Image = imageData;
                    // imageBuffer = Buffer.from(imageData, 'base64');
                } else {
                    // Unknown format, try to convert
                    base64Image = String(imageData);
                    // imageBuffer = Buffer.from(base64Image, 'base64');
                }

                const imageDataUrl = `data:image/png;base64,${base64Image}`;
                // Do not write to filesystem; return data only
                return {
                    success: true,
                    imageData: base64Image,
                    imageUrl: imageDataUrl,
                };
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
