import { Message, PromptTemplate } from '../types/conversation';

export interface ContextPlaceholders {
    [key: string]: string;
}

export class ContextBuilder {
    /**
     * Build context placeholders from conversation messages and last message
     * Messages 0 to N-1 provide context, message N determines the routing
     */
    buildPlaceholders(
        messages: Message[],
        conversationSummary: string
    ): ContextPlaceholders {
        if (messages.length === 0) {
            return {
                '{{CONVERSATION_SUMMARY}}': 'No conversation history',
                '{{CURRENT_MESSAGE}}': 'No message provided'
            };
        }

        // Last message (index N) is the current request
        const lastMessage = messages[messages.length - 1];
        const currentMessageText = this.extractCurrentMessage(lastMessage);
        const imageContext = this.extractImageContext(lastMessage);
        const videoContext = this.extractVideoContext(messages);

        const placeholders: ContextPlaceholders = {
            '{{CONVERSATION_SUMMARY}}': conversationSummary,
            '{{CURRENT_MESSAGE}}': currentMessageText,
            '{{IMAGE_CONTEXT}}': imageContext,
            '{{VIDEO_CONTEXT}}': videoContext,
            '{{MEDIA_CONTEXT}}': this.buildMediaContext(imageContext, videoContext)
        };

        return placeholders;
    }

    /**
     * Extract the current message text from the last message
     */
    private extractCurrentMessage(lastMessage: Message): string {
        const textContents = lastMessage.content
            .filter(c => c.type === 'text' && c.text)
            .map(c => c.text)
            .join('\n');

        return textContents || '[No text content]';
    }

    /**
     * Extract image context from the last message
     * Includes both text references and actual images shared
     */
    private extractImageContext(lastMessage: Message): string {
        const imageContents = lastMessage.content.filter(c => c.type === 'image');

        if (imageContents.length === 0) {
            return 'No images provided in current request.';
        }

        const parts: string[] = [`${imageContents.length} image(s) included in the request:`];

        imageContents.forEach((img, index) => {
            if (img.imageUrl) {
                parts.push(`Image ${index + 1}: ${img.imageUrl}`);
            } else if (img.imageData) {
                parts.push(`Image ${index + 1}: [Base64 encoded image data]`);
            }
        });

        return parts.join('\n');
    }

    /**
     * Extract video context from conversation history
     * Looks at messages 0 to N-1 for video-related context
     */
    private extractVideoContext(messages: Message[]): string {
        const previousMessages = messages.slice(0, -1);

        const videoRelatedMessages = previousMessages.filter(msg => {
            const text = msg.content
                .filter(c => c.type === 'text' && c.text)
                .map(c => c.text?.toLowerCase() || '')
                .join(' ');

            return text.includes('video') || text.includes('duration') ||
                   text.includes('animation') || text.includes('scene');
        });

        if (videoRelatedMessages.length === 0) {
            return 'No video-specific context from previous conversation.';
        }

        return `Found ${videoRelatedMessages.length} video-related message(s) in conversation history.`;
    }

    /**
     * Build combined media context for mixed-media prompts
     */
    private buildMediaContext(imageContext: string, videoContext: string): string {
        return `Image Context:\n${imageContext}\n\nVideo Context:\n${videoContext}`;
    }

    /**
     * Replace placeholders in a prompt template with actual values
     */
    fillTemplate(template: PromptTemplate, placeholders: ContextPlaceholders): string {
        let filledPrompt = template.template;

        // Replace all placeholders with their values
        for (const [placeholder, value] of Object.entries(placeholders)) {
            // Use regex to replace all occurrences
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            filledPrompt = filledPrompt.replace(regex, value);
        }

        // Clean up any remaining unreplaced placeholders
        filledPrompt = this.cleanupUnreplacedPlaceholders(filledPrompt);

        return filledPrompt;
    }

    /**
     * Remove or replace any placeholders that weren't filled
     */
    private cleanupUnreplacedPlaceholders(prompt: string): string {
        // Replace any remaining {{PLACEHOLDER}} with empty string or a note
        return prompt.replace(/\{\{[A-Z_]+\}\}/g, '[Context not available]');
    }

    /**
     * Extract all images from messages (both current and previous)
     */
    extractAllImages(messages: Message[]): Array<{ url?: string; data?: string; source: 'previous' | 'current' }> {
        const images: Array<{ url?: string; data?: string; source: 'previous' | 'current' }> = [];

        // Images from messages 0 to N-1 (previous context)
        const previousMessages = messages.slice(0, -1);
        previousMessages.forEach(msg => {
            msg.content.forEach(content => {
                if (content.type === 'image') {
                    images.push({
                        url: content.imageUrl,
                        data: content.imageData,
                        source: 'previous'
                    });
                }
            });
        });

        // Images from message N (current request)
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            lastMessage.content.forEach(content => {
                if (content.type === 'image') {
                    images.push({
                        url: content.imageUrl,
                        data: content.imageData,
                        source: 'current'
                    });
                }
            });
        }

        return images;
    }
}
