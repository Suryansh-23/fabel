export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: MessageContent[];
    timestamp?: string;
    username?: string; // For multi-user conversations (e.g., @username)
}

export interface MessageContent {
    type: 'text' | 'image';
    text?: string;
    imageUrl?: string;
    imageData?: string; // base64 encoded
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
