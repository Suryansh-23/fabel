import { GoogleGenAI } from '@google/genai';
import { Message, AnalysisResult } from '../../types/conversation';

export class MessageAnalyzer {
    private client: GoogleGenAI;
    private projectId: string;
    private location: string;

    constructor() {
        this.projectId = process.env.GOOGLE_VERTEX_PROJECT || '';
        this.location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';

        if (!this.projectId) {
            throw new Error('GOOGLE_VERTEX_PROJECT is required for message analysis');
        }
        
        // Initialise the client for sending messages ...  
        this.client = new GoogleGenAI({
            vertexai: true,
            project: this.projectId,
            location: this.location,
        });
    }

    /**
     * Analyzes the last message using Gemini to determine intent
     * Handles multi-user conversations with @mentions and image references
     */
    async analyzeMessage(lastMessage: Message, conversationHistory?: Message[]): Promise<AnalysisResult> {
        try {
            // Build the analysis prompt
            const analysisPrompt = this.buildAnalysisPrompt(lastMessage, conversationHistory);

            // Call Gemini for intent analysis using streaming
            const response = await this.client.models.generateContentStream({
                model: 'gemini-2.0-flash-exp',
                contents: analysisPrompt
            });

            let text = '';
            for await (const chunk of response) {
                if (chunk.text) {
                    text += chunk.text;
                }
            }

            return this.parseAnalysisResponse(text);
        } catch (error) {
            console.error('Error analyzing message with Gemini: ', error);
            // Fallback to simple text intent
            return {
                needsImageGeneration: false,
                needsVideoGeneration: false,
                intent: 'text',
                confidence: 0.5,
                reasoning: 'Analysis failed, defaulting to text intent'
            };
        }
    }

    /**
     * Build the analysis prompt for Gemini
     */
    private buildAnalysisPrompt(lastMessage: Message, conversationHistory?: Message[]): string {
        let prompt = `You are an expert at analyzing conversation messages to determine user intent.

Analyze the following message and determine if it requires:
1. Image generation
2. Video generation
3. Text-only response

`;

        // Add conversation history context if available
        if (conversationHistory && conversationHistory.length > 0) {
            prompt += `Conversation history:\n`;
            conversationHistory.forEach((msg, idx) => {
                const username = msg.username ? `@${msg.username}` : msg.role;
                const textContent = this.extractTextContent(msg);
                const hasImages = msg.content.some(c => c.type === 'image');
                prompt += `${idx + 1}. ${username}: ${textContent}${hasImages ? ' [includes image(s)]' : ''}\n`;
            });
            prompt += `\n`;
        }

        // Add the current message
        const username = lastMessage.username ? `@${lastMessage.username}` : 'User';
        const textContent = this.extractTextContent(lastMessage);
        const hasImages = lastMessage.content.some(c => c.type === 'image');

        prompt += `Current message to analyze:
${username}: ${textContent}${hasImages ? ' [includes image(s)]' : ''}

Analyze this message and respond in the following JSON format:
{
  "needsImageGeneration": boolean,
  "needsVideoGeneration": boolean,
  "intent": "text" | "image" | "video" | "mixed",
  "confidence": number (0-1),
  "reasoning": "Brief explanation of your analysis"
}

Consider:
- Direct requests like "generate an image", "create a video"
- Implicit requests like "show me", "I want to see"
- References to visual content or media
- Context from previous messages
- @mentions requesting visual content from AI agents
- If the message mentions both image and video needs, use "mixed" intent

Respond ONLY with valid JSON, no other text.`;

        return prompt;
    }

    /**
     * Extract all text content from a message
     */
    private extractTextContent(message: Message): string {
        return message.content
            .filter(c => c.type === 'text' && c.text)
            .map(c => c.text)
            .join(' ');
    }

    /**
     * Parse the LLM response into AnalysisResult
     */
    private parseAnalysisResponse(responseText: string): AnalysisResult {
        try {
            // Extract JSON from the response (in case there's extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                needsImageGeneration: parsed.needsImageGeneration || false,
                needsVideoGeneration: parsed.needsVideoGeneration || false,
                intent: parsed.intent || 'text',
                confidence: parsed.confidence || 0.5,
                reasoning: parsed.reasoning || 'Analysis completed'
            };
        } catch (error) {
            console.error('Error parsing LLM response:', error);
            console.error('Response text:', responseText);

            // Fallback parsing
            return {
                needsImageGeneration: false,
                needsVideoGeneration: false,
                intent: 'text',
                confidence: 0.5,
                reasoning: 'Failed to parse LLM response'
            };
        }
    }
}
