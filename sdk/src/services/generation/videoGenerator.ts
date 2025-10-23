import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

export interface VideoGenerationResult {
    success: boolean;
    videoUrl?: string;
    videoPath?: string; // file system path
    videoData?: Buffer; // video binary data
    error?: string;
}

export interface VeoPromptStructure {
    subject: string;
    action: string;
    scene: string;
    cameraAngle: string;
    style: string;
    duration: string;
    lighting: string;
    mood: string;
    technicalSpecs: string;
}

export class VideoGenerator {
    private client: GoogleGenAI;
    private projectId: string;
    private location: string;
    private lastRequestTime = 0;
    private readonly MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

    constructor() {
        this.projectId = process.env.GOOGLE_VERTEX_PROJECT || '';
        this.location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';

        if (!this.projectId) {
            throw new Error('GOOGLE_VERTEX_PROJECT is required for video generation');
        }

        console.log(`Video Generator initialized - Project: ${this.projectId}, Location: ${this.location}`);

        this.client = new GoogleGenAI({
            vertexai: true,
            project: this.projectId,
            location: this.location,
        });
    }

    /**
     * Optimize prompt for Veo 3.0 using the 9 core elements structure
     * @param rawPrompt - The original user prompt
     * @returns Promise<string> - Optimized Veo 3.0 prompt
     */
    private async optimizePromptForVeo(rawPrompt: string): Promise<string> {
        try {
            // Use Gemini to structure the prompt according to Veo 3.0 best practices
            const optimizationPrompt = `Act as an expert prompter for Google's Veo 3.0 video generation model. 
            
Transform this user request into a comprehensive Veo 3.0 prompt using the 9 core elements:

User Request: "${rawPrompt}"

Create a detailed prompt that includes:
1. SUBJECT: Clear description of the main subject(s) - people, animals, objects, or multiple subjects
2. ACTION: Specific actions, movements, interactions, or transformations
3. SCENE/CONTEXT: Location (interior/exterior), time of day, weather, historical period, atmospheric details
4. CAMERA ANGLES: Eye-level, low-angle, high-angle, close-up, wide shot, tracking, etc.
5. STYLE: Visual style, artistic approach, cinematic techniques
6. DURATION: Video length and pacing
7. LIGHTING: Lighting conditions, shadows, illumination
8. MOOD: Emotional tone, atmosphere, feeling
9. TECHNICAL SPECS: Any specific technical requirements

Ensure the prompt is:
- Detailed and specific
- Uses proper cinematic terminology
- Avoids redundant descriptions
- Focuses on visual storytelling
- Is optimized for Veo 3.0's capabilities

Return only the optimized prompt, no explanations.`;

            const response = await this.client.models.generateContent({
                model: 'gemini-1.5-pro',
                contents: optimizationPrompt,
            });

            // Extract the optimized prompt from response
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    return candidate.content.parts[0].text || rawPrompt;
                }
            }

            return rawPrompt; // Fallback to original prompt
        } catch (error) {
            console.warn('Failed to optimize prompt, using original:', error);
            return rawPrompt;
        }
    }

    /**
     * Rate limiting to prevent 429 errors
     */
    private async enforceRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }

    /**
     * Retry logic with exponential backoff for 429 errors
     */
    private async retryWithBackoff<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;

                // Check if it's a rate limit error
                if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate limit')) {
                    if (attempt < maxRetries) {
                        const delay = baseDelay * Math.pow(2, attempt);
                        console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }

                // For non-rate-limit errors, throw immediately
                throw error;
            }
        }

        throw lastError!;
    }

    /**
     * Generate a video using Google's Veo 3.0 model with optimized prompting
     * @param prompt - The text prompt describing the video to generate
     * @returns Promise<VideoGenerationResult> - The generated video result
     */
    async generateVideo(prompt: string): Promise<VideoGenerationResult> {
        try {
            console.log('Generating video with Google Veo 3.0, original prompt:', prompt);

            // Optimize prompt for Veo 3.0
            const optimizedPrompt = await this.optimizePromptForVeo(prompt);
            console.log('Optimized Veo 3.0 prompt:', optimizedPrompt);

            // Enforce rate limiting
            await this.enforceRateLimit();

            // Generate video with retry logic
            const response = await this.retryWithBackoff(async () => {
                return await this.client.models.generateContent({
                    model: 'veo-3.0-generate-001',
                    contents: optimizedPrompt
                });
            });

            // Extract video data from response
            const videoData = await this.extractVideoFromResponse(response);

            if (videoData) {
                // Save to output folder
                const timestamp = Date.now();
                const outputDir = path.join(__dirname, '../../output');
                const fileName = `generated_video_${timestamp}.mp4`;
                const filePath = path.join(outputDir, fileName);

                try {
                    // Ensure output directory exists
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }

                    // Write video data to file
                    fs.writeFileSync(filePath, videoData);
                    console.log(`Video saved to: ${filePath}`);

                    return {
                        success: true,
                        videoPath: filePath,
                        videoData: videoData,
                    };
                } catch (saveError) {
                    console.error('Error saving video file:', saveError);
                    // Still return success with video data even if file save fails
                    return {
                        success: true,
                        videoData: videoData,
                    };
                }
            }

            return {
                success: false,
                error: 'No video data returned from API',
            };
        } catch (error) {
            console.error('Error generating video:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Generate video from image using Veo 3.0 image-to-video feature
     * @param imagePath - Path to the source image
     * @param motionPrompt - Prompt describing only the motion/animation (not the subject/scene)
     * @returns Promise<VideoGenerationResult> - The generated video result
     */
    async generateVideoFromImage(imagePath: string, motionPrompt: string): Promise<VideoGenerationResult> {
        try {
            console.log('Generating video from image with Veo 3.0, image:', imagePath, 'motion:', motionPrompt);

            // Read the image file
            const imageBuffer = fs.readFileSync(imagePath);
            const imageBase64 = imageBuffer.toString('base64');

            // Optimize motion prompt for image-to-video
            const optimizedMotionPrompt = await this.optimizeMotionPrompt(motionPrompt);
            console.log('Optimized motion prompt:', optimizedMotionPrompt);

            // Enforce rate limiting
            await this.enforceRateLimit();

            // Generate video with retry logic
            const response = await this.retryWithBackoff(async () => {
                return await this.client.models.generateContent({
                    model: 'veo-3.0-generate-001',
                    contents: [
                        {
                            parts: [
                                {
                                    text: optimizedMotionPrompt
                                },
                                {
                                    inlineData: {
                                        mimeType: 'image/jpeg',
                                        data: imageBase64
                                    }
                                }
                            ]
                        }
                    ]
                });
            });

            // Extract video data from response
            const videoData = await this.extractVideoFromResponse(response);

            if (videoData) {
                // Save to output folder
                const timestamp = Date.now();
                const outputDir = path.join(__dirname, '../../output');
                const fileName = `generated_video_from_image_${timestamp}.mp4`;
                const filePath = path.join(outputDir, fileName);

                try {
                    // Ensure output directory exists
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }

                    // Write video data to file
                    fs.writeFileSync(filePath, videoData);
                    console.log(`Video from image saved to: ${filePath}`);

                    return {
                        success: true,
                        videoPath: filePath,
                        videoData: videoData,
                    };
                } catch (saveError) {
                    console.error('Error saving video file:', saveError);
                    return {
                        success: true,
                        videoData: videoData,
                    };
                }
            }

            return {
                success: false,
                error: 'No video data returned from API',
            };
        } catch (error) {
            console.error('Error generating video from image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Optimize motion prompt for image-to-video generation
     * @param motionPrompt - The original motion prompt
     * @returns Promise<string> - Optimized motion prompt
     */
    private async optimizeMotionPrompt(motionPrompt: string): Promise<string> {
        try {
            const optimizationPrompt = `Act as an expert for Veo 3.0 image-to-video generation. 
            
Transform this motion request into an optimized prompt for image-to-video:

Motion Request: "${motionPrompt}"

For image-to-video, focus ONLY on:
1. CAMERA MOTION: Camera movements (dolly in/out, pan, tilt, zoom, etc.)
2. SUBJECT ANIMATION: How the main subject should move or animate
3. ENVIRONMENTAL ANIMATION: Background elements, atmosphere, lighting changes

DO NOT describe:
- The subject (already in the image)
- The scene/background (already in the image)
- Lighting setup (already in the image)

Use terms like "the subject", "the character", "the person" instead of describing who they are.

Return only the optimized motion prompt.`;

            const response = await this.client.models.generateContent({
                model: 'gemini-1.5-pro',
                contents: optimizationPrompt,
            });

            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    return candidate.content.parts[0].text || motionPrompt;
                }
            }

            return motionPrompt;
        } catch (error) {
            console.warn('Failed to optimize motion prompt, using original:', error);
            return motionPrompt;
        }
    }

    /**
     * Extract video data from the API response
     * This method handles different response formats from the Veo API
     */
    private async extractVideoFromResponse(response: any): Promise<Buffer | null> {
        try {
            // Handle streaming response
            if (typeof response[Symbol.asyncIterator] === 'function') {
                let videoBuffer: Buffer | null = null;

                for await (const chunk of response) {
                    // Check if chunk contains video data
                    if (chunk.data) {
                        if (Buffer.isBuffer(chunk.data)) {
                            videoBuffer = chunk.data;
                        } else if (typeof chunk.data === 'string') {
                            // If it's base64 encoded
                            videoBuffer = Buffer.from(chunk.data, 'base64');
                        }
                        break; // Take first video data
                    }

                    // Check for candidates with video content
                    if (chunk.candidates && chunk.candidates.length > 0) {
                        const candidate = chunk.candidates[0];
                        if (candidate.content && candidate.content.parts) {
                            for (const part of candidate.content.parts) {
                                if (part.inlineData && part.inlineData.data) {
                                    const data = part.inlineData.data;
                                    videoBuffer = Buffer.isBuffer(data)
                                        ? data
                                        : Buffer.from(data, 'base64');
                                    break;
                                }
                            }
                        }
                    }
                }

                return videoBuffer;
            }

            // Handle direct response object
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData && part.inlineData.data) {
                            const data = part.inlineData.data;
                            return Buffer.isBuffer(data)
                                ? data
                                : Buffer.from(data, 'base64');
                        }
                    }
                }
            }

            // Handle direct video data
            if (response.data) {
                return Buffer.isBuffer(response.data)
                    ? response.data
                    : Buffer.from(response.data, 'base64');
            }

            return null;
        } catch (error) {
            console.error('Error extracting video from response:', error);
            return null;
        }
    }
}
