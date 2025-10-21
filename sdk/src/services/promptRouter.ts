import { AnalysisResult, PromptTemplate } from '../types/conversation';

export class PromptRouter {
    private prompts: Map<string, PromptTemplate> = new Map();

    constructor() {
        this.initializeDefaultPrompts();
    }

    /**
     * Initialize default prompt templates
     */
    private initializeDefaultPrompts() {
        // Text-only prompt
        this.registerPrompt({
            id: 'text-conversation',
            name: 'Text Conversation',
            supportedContentTypes: ['text'],
            placeholders: ['{{CONVERSATION_SUMMARY}}', '{{CURRENT_MESSAGE}}'],
            template: `You are a helpful AI assistant engaged in a conversation.

{{CONVERSATION_SUMMARY}}

Current request:
{{CURRENT_MESSAGE}}

Please provide a thoughtful and relevant response based on the conversation history and current message.`
        });

        // Image generation prompt
        this.registerPrompt({
            id: 'image-generation',
            name: 'Image Generation',
            supportedContentTypes: ['text', 'image'],
            placeholders: ['{{CONVERSATION_SUMMARY}}', '{{CURRENT_MESSAGE}}', '{{IMAGE_CONTEXT}}'],
            template: `You are an AI assistant specialized in generating images based on user requests.

{{CONVERSATION_SUMMARY}}

Current image generation request:
{{CURRENT_MESSAGE}}

{{IMAGE_CONTEXT}}

Based on the conversation history and current request, generate a detailed image description or prompt that captures:
1. The specific visual elements requested
2. Style and mood inferred from the conversation
3. Any constraints or preferences mentioned in previous messages
4. Composition and visual details`
        });

        // Video generation prompt
        this.registerPrompt({
            id: 'video-generation',
            name: 'Video Generation',
            supportedContentTypes: ['text', 'video'],
            placeholders: ['{{CONVERSATION_SUMMARY}}', '{{CURRENT_MESSAGE}}', '{{VIDEO_CONTEXT}}'],
            template: `You are an AI assistant specialized in generating videos and animations.

{{CONVERSATION_SUMMARY}}

Current video generation request:
{{CURRENT_MESSAGE}}

{{VIDEO_CONTEXT}}

Based on the conversation history and current request, create a detailed video generation plan including:
1. Scene breakdown and sequence based on conversational context
2. Visual elements building on previous discussion
3. Motion, transitions, and timing
4. Overall narrative flow considering the conversation thread`
        });

        // Mixed media prompt
        this.registerPrompt({
            id: 'mixed-media',
            name: 'Mixed Media Generation',
            supportedContentTypes: ['text', 'image', 'video'],
            placeholders: ['{{CONVERSATION_SUMMARY}}', '{{CURRENT_MESSAGE}}', '{{MEDIA_CONTEXT}}'],
            template: `You are an AI assistant capable of handling complex multi-media requests.

{{CONVERSATION_SUMMARY}}

Current multi-media request:
{{CURRENT_MESSAGE}}

{{MEDIA_CONTEXT}}

Provide a comprehensive response addressing both image and video generation needs, considering the full conversation context:
1. Image generation specifications
2. Video/animation specifications
3. How these media elements relate to the conversation thread
4. Workflow for creating the requested content`
        });
    }

    /**
     * Register a new prompt template
     */
    registerPrompt(prompt: PromptTemplate) {
        this.prompts.set(prompt.id, prompt);
    }

    /**
     * Route to the appropriate prompt based on analysis of the last message
     */
    route(analysis: AnalysisResult): PromptTemplate {
        let selectedPrompt: PromptTemplate;

        switch (analysis.intent) {
            case 'image':
                selectedPrompt = this.prompts.get('image-generation')!;
                break;
            case 'video':
                selectedPrompt = this.prompts.get('video-generation')!;
                break;
            // case 'mixed':
            //     selectedPrompt = this.prompts.get('mixed-media')!;
            //     break;
            case 'text':
            default:
                selectedPrompt = this.prompts.get('text-conversation')!;
                break;
        }

        return selectedPrompt;
    }

    /**
     * Get a specific prompt by ID
     */
    getPrompt(id: string): PromptTemplate | undefined {
        return this.prompts.get(id);
    }

    /**
     * List all available prompts
     */
    listPrompts(): PromptTemplate[] {
        return Array.from(this.prompts.values());
    }

    /**
     * Remove a prompt template
     */
    unregisterPrompt(id: string): boolean {
        return this.prompts.delete(id);
    }
}
