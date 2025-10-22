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

        // Use the image in any part of the conversationSummary 
        const lastMessage = messages[messages.length - 1];
        const currentMessageText = this.extractCurrentMessage(lastMessage);
        const imageContext = this.extractImageContext(messages);
        console.log("ImageContext... ", imageContext);
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
     * Extract the current message text and image URLs from the last message
     */
    private extractCurrentMessage(lastMessage: Message): string {
        const parts: string[] = [];

        // Extract text content
        const textContents = lastMessage.content
            .filter(c => c.type === 'text' && c.text)
            .map(c => c.text)
            .join('\n');

        if (textContents) {
            parts.push(textContents);
        }

        // Extract image URLs from the last message
        const imageUrls: string[] = [];
        lastMessage.content.forEach(content => {
            if (content.type === 'image') {
                if (content.imageUrl) {
                    // Skip blob URLs as they cannot be accessed from Node.js
                    if (content.imageUrl.startsWith('blob:')) {
                        imageUrls.push('[Blob URL - not accessible from server]');
                    } else {
                        imageUrls.push(content.imageUrl);
                    }
                } else if (content.imageData) {
                    imageUrls.push('[Base64 encoded image]');
                }
            }
        });

        // Add image URLs to the message
        if (imageUrls.length > 0) {
            parts.push(`\n[Images in current message: ${imageUrls.join(', ')}]`);
        }

        return parts.length > 0 ? parts.join('\n') : '[No text content]';
    }

    /**
     * Extract image context from all messages
     * Extracts images from content array where type is 'image'
     * Also extracts image URLs found in text content
     * Filters out blob URLs as they cannot be accessed from Node.js
     */
    private extractImageContext(messages: Message[]): string {
        const imageAddresses: string[] = [];

        console.log('extractImageContext - Total messages:', messages.length);

        // Search through all messages
        messages.forEach((msg, msgIndex) => {
            msg.content.forEach((content, _) => {
                if (content.type === 'image') {
                    // Extract imageUrl or imageData from image content
                    if (content.imageUrl) {
                        // Skip blob URLs
                        if (content.imageUrl.startsWith('blob:')) {
                            console.log(`  ⚠️  Skipping blob URL in message ${msgIndex}:`, content.imageUrl);
                            imageAddresses.push('[Blob URL - not accessible from server]');
                        } else {
                            console.log(`  Found image URL in message ${msgIndex}:`, content.imageUrl);
                            imageAddresses.push(content.imageUrl);
                        }
                    } else if (content.imageData) {
                        console.log(`  Found base64 image data in message ${msgIndex}`);
                        imageAddresses.push('[Base64 encoded image data]');
                    }
                } else if (content.type === 'text' && content.text) {
                    // Extract image URLs from text content using regex
                    const urlRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|svg|bmp|ico)(?:\?[^\s]*)?)/gi;
                    const matches = content.text.match(urlRegex);
                    if (matches) {
                        matches.forEach(url => {
                            console.log(`  Found image URL in text of message ${msgIndex}:`, url);
                            imageAddresses.push(url);
                        });
                    }
                }
            });
        });

        console.log('Total image addresses found:', imageAddresses.length);
        console.log('Image addresses:', imageAddresses);

        if (imageAddresses.length === 0) {
            return 'No images provided in current request.';
        }

        const parts: string[] = [`${imageAddresses.length} image(s) included in the request:`];

        imageAddresses.forEach((address, index) => {
            parts.push(`Image ${index + 1}: ${address}`);
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
     * Includes both structured image content and URLs found in text
     * Filters out blob URLs as they cannot be accessed from Node.js
     */
    extractAllImages(messages: Message[]): Array<{ url?: string; data?: string; source: 'previous' | 'current' }> {
        const images: Array<{ url?: string; data?: string; source: 'previous' | 'current' }> = [];

        // Images from messages 0 to N-1 (previous context)
        const previousMessages = messages.slice(0, -1);
        previousMessages.forEach(msg => {
            msg.content.forEach(content => {
                if (content.type === 'image') {
                    // Skip blob URLs
                    if (content.imageUrl && !content.imageUrl.startsWith('blob:')) {
                        images.push({
                            url: content.imageUrl,
                            data: content.imageData,
                            source: 'previous'
                        });
                    } else if (content.imageData) {
                        // Include base64 data even without URL
                        images.push({
                            data: content.imageData,
                            source: 'previous'
                        });
                    }
                } else if (content.type === 'text' && content.text) {
                    // Extract image URLs from text content
                    const urlRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|svg|bmp|ico)(?:\?[^\s]*)?)/gi;
                    const matches = content.text.match(urlRegex);
                    if (matches) {
                        matches.forEach(url => {
                            images.push({
                                url: url,
                                source: 'previous'
                            });
                        });
                    }
                }
            });
        });

        // Images from message N (current request)
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            lastMessage.content.forEach(content => {
                if (content.type === 'image') {
                    // Skip blob URLs
                    if (content.imageUrl && !content.imageUrl.startsWith('blob:')) {
                        images.push({
                            url: content.imageUrl,
                            data: content.imageData,
                            source: 'current'
                        });
                    } else if (content.imageData) {
                        // Include base64 data even without URL
                        images.push({
                            data: content.imageData,
                            source: 'current'
                        });
                    }
                } else if (content.type === 'text' && content.text) {
                    // Extract image URLs from text content
                    const urlRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|svg|bmp|ico)(?:\?[^\s]*)?)/gi;
                    const matches = content.text.match(urlRegex);
                    if (matches) {
                        matches.forEach(url => {
                            images.push({
                                url: url,
                                source: 'current'
                            });
                        });
                    }
                }
            });
        }

        return images;
    }
}
