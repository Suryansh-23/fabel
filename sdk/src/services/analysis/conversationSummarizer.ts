import { Message, MessageContent } from '../../types/conversation';
import { GoogleGenAI } from '@google/genai';

export class ConversationSummarizer {
    private client: GoogleGenAI;
    private projectId: string;
    private location: string;

    constructor() {
        this.projectId = process.env.GOOGLE_VERTEX_PROJECT || '';
        this.location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';

        if (!this.projectId) {
            throw new Error('GOOGLE_VERTEX_PROJECT is required for conversation summarization');
        }

        this.client = new GoogleGenAI({
            vertexai: true,
            project: this.projectId,
            location: this.location,
        });
    }
    /**
     * Build a summary from all messages (0 to N) including the last message
     * The last message and any images it contains are now included in the summary
     * to provide complete context for the generation process
     */

    /**
     * Create a summary of the conversation using LLM (gemini-2.0-flash-exp)
     * Summarizes the conversation context while preserving image URLs, video URLs
     * Uses LLM summarization when conversation exceeds maxMessages threshold
     * Generates context that fits in approximately maxMessages worth of content
     *
     * @param messages - Array of messages to summarize (includes all messages 0 to N)
     * @param maxMessages - Maximum number of messages before triggering LLM summarization (default: 5)
     * @param useLLM - Whether to use LLM summarization (default: true)
     * @returns Summary string or Promise<string>
     */
    async summarize(messages: Message[], maxMessages: number = 5, useLLM: boolean = true): Promise<string> {
        if (messages.length === 0) {
            return 'No previous conversation context.';
        }

        // Include ALL messages (0 to N) including the last message
        // This ensures any images in the last message are part of the summary
        const allMessages = messages;

        // If conversation is short enough or LLM is disabled, return simple summary
        if (allMessages.length <= maxMessages || !useLLM) {
            return this.formatMessagesForSummary(allMessages);
        }

        // Try LLM summarization with retry logic
        const maxRetries = 3;
        const baseDelay = 1000; // 1 second

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Build the conversation for LLM to summarize (including last message)
                const conversationText = this.buildConversationTextForLLM(allMessages);

                // Create the summarization prompt
                const prompt = this.buildSummarizationPrompt(conversationText, maxMessages);

                // Call Gemini for summarization
                const response = await this.client.models.generateContentStream({
                    model: 'gemini-2.0-flash-exp',
                    contents: prompt
                });

                let summary = '';
                for await (const chunk of response) {
                    if (chunk.text) {
                        summary += chunk.text;
                    }
                }

                if (summary) {
                    return summary;
                }
            } catch (error: any) {
                const isRateLimitError = error?.status === 429 ||
                                        error?.message?.includes('429') ||
                                        error?.message?.includes('RESOURCE_EXHAUSTED');

                if (isRateLimitError && attempt < maxRetries - 1) {
                    // Exponential backoff: 1s, 2s, 4s
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
                    await this.sleep(delay);
                    continue;
                } else {
                    console.error('Error generating concise summary with LLM:', error);
                    break;
                }
            }
        }

        // Fallback to simple truncation if all retries failed
        console.log('Falling back to simple message formatting');
        return this.formatMessagesForSummary(allMessages.slice(-maxMessages));
    }

    /**
     * Sleep utility for retry delays
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Build conversation text for LLM to summarize
     */
    private buildConversationTextForLLM(messages: Message[]): string {
        const conversationParts: string[] = [];

        messages.forEach((msg, idx) => {
            const rolePrefix = msg.username ? `@${msg.username}` :
                            (msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System');

            const contentParts: string[] = [];
            msg.content.forEach((content: MessageContent) => {
                if (content.type === 'text' && content.text) {
                    contentParts.push(content.text);
                } else if (content.type === 'image') {
                    if (content.imageUrl) {
                        contentParts.push(`[IMAGE_URL: ${content.imageUrl}]`);
                    } else if (content.imageData) {
                        contentParts.push('[IMAGE_DATA]');
                    } else {
                        contentParts.push('[IMAGE]');
                    }
                } else if (content.type === 'video') {
                    if (content.videoUrl) {
                        contentParts.push(`[VIDEO_URL: ${content.videoUrl}]`);
                    } else {
                        contentParts.push('[VIDEO]');
                    }
                }
            });

            conversationParts.push(`${idx + 1}. ${rolePrefix}: ${contentParts.join(' ')}`);
        });

        return conversationParts.join('\n');
    }

    /**
     * Build the summarization prompt for Gemini
     */
    private buildSummarizationPrompt(conversationText: string, maxMessages: number): string {
        return `You are an expert at summarizing conversations while preserving important context and media references.

Summarize the following conversation in a way that:
1. Captures the key context and flow of the conversation
2. PRESERVES ALL image URLs and video URLs exactly as they appear (keep the [IMAGE_URL: ...] format)
3. Maintains important details about what was discussed
4. Fits within approximately ${maxMessages} messages worth of content (aim for concise but complete context)
5. Uses natural language that flows well when read

Conversation to summarize:
${conversationText}

Provide a concise summary that preserves the essential context and all media URLs. Start with "Conversation summary:" and then provide the summary in a natural, readable format.`;
    }

    /**
     * Format messages for simple display (fallback)
     */
    private formatMessagesForSummary(messages: Message[]): string {
        const summaryParts: string[] = [];
        summaryParts.push(`Recent conversation history:\n`);

        messages.forEach((msg) => {
            const content = this.formatMessageContent(msg);
            const rolePrefix = msg.username ? `@${msg.username}` :
                            (msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System');
            summaryParts.push(`${rolePrefix}: ${content}`);
        });

        return summaryParts.join('\n');
    }

    /**
     * Format message content for summary
     */
    private formatMessageContent(message: Message): string {
        const parts: string[] = [];

        message.content.forEach((content: MessageContent) => {
            if (content.type === 'text' && content.text) {
                parts.push(content.text);
            } else if (content.type === 'image') {
                if (content.imageUrl) {
                    parts.push(`[Image: ${content.imageUrl}]`);
                } else {
                    parts.push('[Image data]');
                }
            } else if (content.type === 'video') {
                if (content.videoUrl) {
                    parts.push(`[Video: ${content.videoUrl}]`);
                } else {
                    parts.push('[Video data]');
                }
            }
        });

        return parts.join(' ') || '[Empty message]';
    }

    /**
     * Extract key topics from conversation history
     */
    extractKeyTopics(messages: Message[]): string[] {
        const previousMessages = messages.slice(0, -1);
        const topics = new Set<string>();

        previousMessages.forEach(msg => {
            const text = this.formatMessageContent(msg);
            // Simple keyword extraction (can be enhanced with NLP)
            const words = text.toLowerCase()
                .split(/\s+/)
                .filter(word => word.length > 4); // Only words longer than 4 chars

            words.forEach(word => {
                // Remove punctuation
                const cleaned = word.replace(/[^\w]/g, '');
                if (cleaned.length > 4) {
                    topics.add(cleaned);
                }
            });
        });

        return Array.from(topics).slice(0, 10); // Return top 10 topics
    }

    /**
     * Get conversation statistics
     */
    getConversationStats(messages: Message[]): {
        totalMessages: number;
        userMessages: number;
        assistantMessages: number;
        systemMessages: number;
        imagesShared: number;
    } {
        const previousMessages = messages.slice(0, -1);

        return {
            totalMessages: previousMessages.length,
            userMessages: previousMessages.filter(m => m.role === 'user').length,
            assistantMessages: previousMessages.filter(m => m.role === 'assistant').length,
            systemMessages: previousMessages.filter(m => m.role === 'system').length,
            imagesShared: previousMessages.reduce((count, msg) => {
                return count + msg.content.filter(c => c.type === 'image').length;
            }, 0)
        };
    }
}
