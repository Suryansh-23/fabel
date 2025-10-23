import { GoogleGenAI } from '@google/genai';

export interface TextGenerationResult {
    success: boolean;
    text?: string;
    error?: string;
}

export class TextGenerator {
    private client: GoogleGenAI;
    private projectId: string;
    private location: string;

    constructor() {
        this.projectId = process.env.GOOGLE_VERTEX_PROJECT || '';
        this.location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';

        if (!this.projectId) {
            throw new Error('GOOGLE_VERTEX_PROJECT is required for text generation');
        }

        this.client = new GoogleGenAI({
            vertexai: true,
            project: this.projectId,
            location: this.location,
        });
    }

    /**
     * Generate a text response using Gemini
     */
    async generateText(prompt: string): Promise<TextGenerationResult> {
        try {
            console.log('Generating text response with prompt:', prompt);

            const response = await this.client.models.generateContentStream({
                model: 'gemini-2.0-flash-exp',
                contents: prompt
            });

            let generatedText = '';

            for await (const chunk of response) {
                if (chunk.text) {
                    generatedText += chunk.text;
                }
            }

            if (generatedText.trim()) {
                console.log('Text generated successfully');
                return {
                    success: true,
                    text: generatedText.trim()
                };
            } else {
                console.error('No text generated from Gemini');
                return {
                    success: false,
                    error: 'No text generated from AI model'
                };
            }
        } catch (error) {
            console.error('Error generating text:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during text generation'
            };
        }
    }
}
