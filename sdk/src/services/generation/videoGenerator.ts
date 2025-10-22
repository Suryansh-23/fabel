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

export class VideoGenerator {
    private client: GoogleGenAI;
    private projectId: string;
    private location: string;

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
     * Generate a video using Google's Veo 3.0 model
     * @param prompt - The text prompt describing the video to generate
     * @returns Promise<VideoGenerationResult> - The generated video result
     */
    async generateVideo(prompt: string): Promise<VideoGenerationResult> {
        try {
            console.log('Generating video with Google Veo 3.0, prompt:', prompt);

            const response = await this.client.models.generateContent({
                model: 'veo-3.0-generate-001',
                contents: prompt,
            });

            // Extract video data from response
            // The response structure may vary - adjust based on actual API response
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
