
export interface UserMsg {
    handle: string;
    username: string;
    msg: string;
    media?: string; // Image URL or video URL
}

export interface InputContext {
    context: Array<{
        depth: number;  // indexing of the array
        userMsg: UserMsg;
    }>;
}

export enum OutputType {
    Text = "text",
    Image = "image",
    Video = "video"
}

export interface Output {
    outputType: OutputType;
    text?: string;
    image?: string; // PNG file path or URL
    video?: Blob;
}




// Legacy types for backward compatibility (to be removed after migration)
export interface MessageContent {
    type: 'text' | 'image' | 'video';
    text?: string;
    imageUrl?: string;
    imageData?: string;
    videoUrl?: string;
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    username?: string;
    content: MessageContent[];
    timestamp?: string;
}

export interface ConversationContext {
    messages: Message[];
    metadata?: Record<string, any>;
}

export interface AnalysisResult {
    needsImageGeneration: boolean;
    needsVideoGeneration: boolean;
    intent: 'text' | 'image' | 'video' | 'mixed';
    confidence: number;
    reasoning?: string;
}

export interface PromptTemplate {
    id: string;
    name: string;
    template: string;
    supportedContentTypes: ('text' | 'image' | 'video')[];
    placeholders: string[];
}

export interface ProcessedRequest {
    lastMessage: Message;
    summary: string;
    analysis: AnalysisResult;
    selectedPrompt: PromptTemplate;
    finalPrompt: string;
    generatedImage?: {
        imageUrl: string;
        imagePath?: string;
        prompt: string;
    };
}

// Conversion utilities between old and new type systems
export class TypeConverter {
    /**
     * Convert new InputContext to legacy ConversationContext
     */
    static inputContextToConversationContext(inputContext: InputContext): ConversationContext {
        const messages: Message[] = inputContext.context.map(({ userMsg }) => ({
            role: 'user' as const,
            username: userMsg.username,
            content: this.userMsgToMessageContent(userMsg),
            timestamp: new Date().toISOString()
        }));

        return {
            messages,
            metadata: {}
        };
    }

    /**
     * Convert UserMsg to MessageContent array
     */
    private static userMsgToMessageContent(userMsg: UserMsg): MessageContent[] {
        const content: MessageContent[] = [];

        // Add text content
        if (userMsg.msg) {
            content.push({
                type: 'text',
                text: userMsg.msg
            });
        }

        // Add media content if present (image or video URL)
        if (userMsg.media) {
            // Detect if it's a video URL
            const isVideoUrl = userMsg.media.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i) ||
                              userMsg.media.includes('youtube.com') ||
                              userMsg.media.includes('vimeo.com');

            if (isVideoUrl) {
                content.push({
                    type: 'video',
                    videoUrl: userMsg.media
                });
            } else {
                // Assume it's an image URL
                content.push({
                    type: 'image',
                    imageUrl: userMsg.media
                });
            }
        }

        return content;
    }

    /**
     * Convert ProcessedRequest to Output
     */
    static processedRequestToOutput(processedRequest: ProcessedRequest): Output {
        const analysis = processedRequest.analysis;

        if (analysis.needsImageGeneration && processedRequest.generatedImage) {
            return {
                outputType: OutputType.Image,
                // Return the PNG file path if available, otherwise the image URL
                image: processedRequest.generatedImage.imagePath || processedRequest.generatedImage.imageUrl
            };
        } else if (analysis.needsVideoGeneration) {
            return {
                outputType: OutputType.Video,
                text: processedRequest.finalPrompt
                // video generation would be implemented here
            };
        } else {
            return {
                outputType: OutputType.Text,
                text: processedRequest.finalPrompt
            };
        }
    }

    /**
     * Convert legacy Message to UserMsg (for backward compatibility)
     */
    static messageToUserMsg(message: Message): UserMsg {
        const textContent = message.content
            .filter(c => c.type === 'text' && c.text)
            .map(c => c.text)
            .join(' ');

        const mediaContent = message.content.find(c => c.type === 'image' || c.type === 'video');
        let media: string | undefined;

        if (mediaContent) {
            if (mediaContent.type === 'image') {
                media = mediaContent.imageUrl || mediaContent.imageData;
            } else if (mediaContent.type === 'video') {
                media = mediaContent.videoUrl;
            }
        }

        return {
            handle: message.username || 'user',
            username: message.username || 'User',
            msg: textContent,
            media
        };
    }
}
