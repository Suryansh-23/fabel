import { ConversationProcessor } from './services/conversationProcessor';
import {
    InputContext,
    Output,
    TypeConverter,
    UserMsg,
    OutputType,
    MessageContent,
    Message,
    ConversationContext,
    AnalysisResult,
    PromptTemplate,
    ProcessedRequest
} from './types/conversation';

/**
 * Main SDK function to process conversational context and generate output
 *
 * @param inputContext - The conversation context with user messages
 * @returns Promise<Output> - The generated output (text, image, or video)
 *
 * @example
 * ```typescript
 * const result = await imagine({
 *   context: [
 *     {
 *       depth: 0,
 *       userMsg: {
 *         handle: 'john_doe',
 *         username: 'John Doe',
 *         msg: 'Create a sunset over mountains',
 *       }
 *     }
 *   ]
 * });
 *
 * if (result.outputType === OutputType.Image) {
 *   console.log('Generated image:', result.image);
 * }
 * ```
 */
export async function imagine(inputContext: InputContext): Promise<Output> {
    // Convert new type system to legacy type system
    const conversationContext = TypeConverter.inputContextToConversationContext(inputContext);

    // Process the conversation
    const processor = new ConversationProcessor();
    const processedRequest = await processor.process(conversationContext);

    // Convert processed request to output
    const output = TypeConverter.processedRequestToOutput(processedRequest);

    return output;
}

// Export all types for SDK consumers
export {
    // Core input/output types
    InputContext,
    Output,
    UserMsg,
    OutputType,

    // Legacy types for advanced usage
    MessageContent,
    Message,
    ConversationContext,
    AnalysisResult,
    PromptTemplate,
    ProcessedRequest,

    // Type converter utility
    TypeConverter,

    // Service classes for advanced customization
    ConversationProcessor
};
