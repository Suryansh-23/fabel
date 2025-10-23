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

        // Video generation prompt - Enhanced for Veo 3.0
        this.registerPrompt({
            id: 'video-generation',
            name: 'Video Generation',
            supportedContentTypes: ['text', 'video'],
            placeholders: ['{{CONVERSATION_SUMMARY}}', '{{CURRENT_MESSAGE}}', '{{VIDEO_CONTEXT}}'],
            template: `You are an expert video generation assistant specialized in creating detailed prompts for Google's Veo 3.0 model.

{{CONVERSATION_SUMMARY}}

Current video generation request:
{{CURRENT_MESSAGE}}

{{VIDEO_CONTEXT}}

Create a comprehensive video generation prompt optimized for Veo 3.0 that includes all 9 core elements:

1. SUBJECT: Describe the main subject(s) - people, animals, objects, or multiple subjects with specific details
2. ACTION: Define specific actions, movements, interactions, emotional expressions, or transformations
3. SCENE/CONTEXT: Set the location (interior/exterior), time of day, weather, historical period, atmospheric details
4. CAMERA ANGLES: Specify camera positioning - eye-level, low-angle, high-angle, close-up, wide shot, tracking, etc.
5. STYLE: Define visual style, artistic approach, cinematic techniques, and aesthetic preferences
6. DURATION: Indicate video length, pacing, and timing considerations
7. LIGHTING: Describe lighting conditions, shadows, illumination, and visual atmosphere
8. MOOD: Establish emotional tone, atmosphere, and overall feeling
9. TECHNICAL SPECS: Include any specific technical requirements or constraints

Ensure the prompt is:
- Detailed and specific with cinematic terminology
- Focuses on visual storytelling and narrative flow
- Avoids redundant descriptions
- Optimized for Veo 3.0's advanced capabilities
- Builds upon the conversation context naturally

Return a single, comprehensive prompt that Veo 3.0 can execute directly.`
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
