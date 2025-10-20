import { Message, MessageContent } from '../../types/conversation';

export class ConversationSummarizer {
    /**
     * Build a summary from messages 0 to N-1 (all messages except the last one)
     * The last message (index N) is used to determine prompt routing (image/video/text)
     * Messages 0 to N-1 provide conversational context leading up to the current request
     */
    summarize(messages: Message[]): string {
        if (messages.length === 0) {
            return 'No previous conversation context.';
        }

        // Get all messages except the last one (0 to N-1)
        const previousMessages = messages.slice(0, -1);

        if (previousMessages.length === 0) {
            return 'This is the first message in the conversation.';
        }

        const summaryParts: string[] = [];
        summaryParts.push(`Conversation history (${previousMessages.length} previous message${previousMessages.length > 1 ? 's' : ''}):\n`);

        // Build conversational context from previous messages
        previousMessages.forEach((msg) => {
            const content = this.formatMessageContent(msg);
            // Use username if available, otherwise use role
            const rolePrefix = msg.username ? `@${msg.username}` :
                            (msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System');
            summaryParts.push(`${rolePrefix}: ${content}`);
        });

        return summaryParts.join('\n');
    }

    /**
     * Create a concise summary (for when conversation is very long)
     * Focuses on the most recent messages (0 to N-1) leading to the current request
     */
    summarizeConcise(messages: Message[], maxMessages: number = 5): string {
        if (messages.length === 0) {
            return 'No previous conversation context.';
        }

        // Get all messages except the last one (0 to N-1)
        const previousMessages = messages.slice(0, -1);

        if (previousMessages.length === 0) {
            return 'This is the first message in the conversation.';
        }

        // If we have more messages than maxMessages, take the most recent ones
        const messagesToSummarize = previousMessages.length > maxMessages
            ? previousMessages.slice(-maxMessages)
            : previousMessages;

        const summaryParts: string[] = [];

        if (previousMessages.length > maxMessages) {
            const skipped = previousMessages.length - maxMessages;
            summaryParts.push(`[Earlier conversation: ${skipped} message${skipped > 1 ? 's' : ''} omitted]\n`);
        }

        summaryParts.push(`Recent conversation history:\n`);

        messagesToSummarize.forEach((msg) => {
            const content = this.formatMessageContent(msg);
            const truncated = content.length > 150 ? content.substring(0, 147) + '...' : content;
            // Use username if available, otherwise use role
            const rolePrefix = msg.username ? `@${msg.username}` :
                              (msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System');
            summaryParts.push(`${rolePrefix}: ${truncated}`);
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
