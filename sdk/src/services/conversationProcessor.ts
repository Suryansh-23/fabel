import { ConversationContext, ProcessedRequest } from '../types/conversation';
import { MessageAnalyzer } from './analysis/messageAnalyzer';
import { ConversationSummarizer } from './analysis/conversationSummarizer';
import { PromptRouter } from './promptRouter';
import { ContextBuilder } from './contextBuilder';
import { ImageGenerator } from './generation/imageGenerator';
import { VideoGenerator } from './generation/videoGenerator';

export class ConversationProcessor {
    private analyzer: MessageAnalyzer;
    private summarizer: ConversationSummarizer;
    private router: PromptRouter;
    private contextBuilder: ContextBuilder;
    private imageGenerator: ImageGenerator;
    private videoGenerator: VideoGenerator;

    constructor() {
        this.analyzer = new MessageAnalyzer();
        this.summarizer = new ConversationSummarizer();
        this.router = new PromptRouter();
        this.contextBuilder = new ContextBuilder();
        this.imageGenerator = new ImageGenerator();
        this.videoGenerator = new VideoGenerator();
    }

    /**
     * Process the incoming conversation context
     * - Analyzes the last message (index N) to determine image/video generation need
     * - Builds summary from messages 0 to N-1 (conversation context)
     * - Routes to appropriate prompt template
     * - Fills placeholders with context
     */
    async process(conversationContext: ConversationContext): Promise<ProcessedRequest> {
        const { messages } = conversationContext;

        if (messages.length === 0) {
            throw new Error('No messages provided in conversation context');
        }

        // Step 1: Get the last message (index N) - this determines routing
        const lastMessage = messages[messages.length - 1];
        console.log('lastMessage', lastMessage);

        // Get conversation history (0 to N-1) for context
        const conversationHistory = messages.slice(0, -1);
        console.log('conversationHistory', conversationHistory);

        // Step 2: Analyze the last message for intent (text/image/video) using Gemini
        const analysis = await this.analyzer.analyzeMessage(lastMessage, conversationHistory);
        console.log('Routing Analysis: ', analysis);

        // Step 3: Build summary from messages 0 to N-1 (conversational context)
        const summary = await this.summarizer.summarize(messages);
        console.log('Summary: ', summary);

        // Step 4: Route to appropriate prompt based on analysis
        const selectedPrompt = this.router.route(analysis);
        console.log("Selected Prompts Analysis: ", selectedPrompt);

        // Step 5: Build context placeholders
        const placeholders = this.contextBuilder.buildPlaceholders(messages, summary);
        console.log(" Final Placeholders:  ", placeholders);

        // Step 6: Fill the prompt template with context
        const finalPrompt = this.contextBuilder.fillTemplate(selectedPrompt, placeholders);
        console.log("Final Prompt sent : ", finalPrompt);

        // For current testing always true
        let generatedImage;
        let generatedVideo;

        if (analysis.needsImageGeneration) {
            console.log('Generating image with final prompt...');

            // Extract image URLs from messages to use as reference
            const allImages = this.contextBuilder.extractAllImages(messages);
            const referenceImageUrl = allImages.length > 0 && allImages[0].url ? allImages[0].url : undefined;

            if (referenceImageUrl) {
                console.log('Using reference image:', referenceImageUrl);
            }

            const imageResult = await this.imageGenerator.generateImage(finalPrompt, referenceImageUrl);
            if (imageResult.success && imageResult.imageUrl) {
                generatedImage = {
                    imageUrl: imageResult.imageUrl,
                    imagePath: imageResult.imagePath,
                    prompt: finalPrompt
                };
                console.log('Image generated successfully');
                if (imageResult.imagePath) {
                    console.log('Saved to:', imageResult.imagePath);
                }
            } else {
                console.error('Image generation failed:', imageResult.error);
            }
        }

        if (analysis.needsVideoGeneration) {
            console.log('Generating video with final prompt...');

            const videoResult = await this.videoGenerator.generateVideo(finalPrompt);
            if (videoResult.success && videoResult.videoPath) {
                generatedVideo = {
                    videoPath: videoResult.videoPath,
                    videoData: videoResult.videoData,
                    prompt: finalPrompt
                };
                console.log('Video generated successfully');
                console.log('Saved to:', videoResult.videoPath);
            } else {
                console.error('Video generation failed:', videoResult.error);
            }
        }

        return {
            lastMessage,
            summary,
            analysis,
            selectedPrompt,
            finalPrompt,
            generatedImage,
            generatedVideo
        };
    }

    /**
     * Process with concise summary for long conversations
     */
    async processConcise(conversationContext: ConversationContext, maxMessages: number = 5): Promise<ProcessedRequest> {
        const { messages } = conversationContext;

        if (messages.length === 0) {
            throw new Error('No messages provided in conversation context');
        }

        const lastMessage = messages[messages.length - 1];
        const conversationHistory = messages.slice(0, -1);
        const analysis = await this.analyzer.analyzeMessage(lastMessage, conversationHistory);
        const summary = await this.summarizer.summarize(messages, maxMessages);
        const selectedPrompt = this.router.route(analysis);
        const placeholders = this.contextBuilder.buildPlaceholders(messages, summary);
        const finalPrompt = this.contextBuilder.fillTemplate(selectedPrompt, placeholders);

        // Generate image if needed
        let generatedImage;
        let generatedVideo;

        if (analysis.needsImageGeneration) {
            console.log('Generating image with final prompt...');

            // Extract image URLs from messages to use as reference
            const allImages = this.contextBuilder.extractAllImages(messages);
            const referenceImageUrl = allImages.length > 0 && allImages[0].url ? allImages[0].url : undefined;

            if (referenceImageUrl) {
                console.log('Using reference image:', referenceImageUrl);
            }

            const imageResult = await this.imageGenerator.generateImage(finalPrompt, referenceImageUrl);
            if (imageResult.success && imageResult.imageUrl) {
                generatedImage = {
                    imageUrl: imageResult.imageUrl,
                    imagePath: imageResult.imagePath,
                    prompt: finalPrompt
                };
                console.log('Image generated successfully');
                if (imageResult.imagePath) {
                    console.log('Saved to:', imageResult.imagePath);
                }
            } else {
                console.error('Image generation failed:', imageResult.error);
            }
        }

        if (analysis.needsVideoGeneration) {
            console.log('Generating video with final prompt...');

            const videoResult = await this.videoGenerator.generateVideo(finalPrompt);
            if (videoResult.success && videoResult.videoPath) {
                generatedVideo = {
                    videoPath: videoResult.videoPath,
                    videoData: videoResult.videoData,
                    prompt: finalPrompt
                };
                console.log('Video generated successfully');
                console.log('Saved to:', videoResult.videoPath);
            } else {
                console.error('Video generation failed:', videoResult.error);
            }
        }

        return {
            lastMessage,
            summary,
            analysis,
            selectedPrompt,
            finalPrompt,
            generatedImage,
            generatedVideo
        };
    }

    /**
     * Get analyzer instance for custom configuration
     */
    getAnalyzer(): MessageAnalyzer {
        return this.analyzer;
    }

    /**
     * Get router instance for custom prompt registration
     */
    getRouter(): PromptRouter {
        return this.router;
    }
}
