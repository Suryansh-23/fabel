import express from 'express';
import { ENV } from './config/env';
import { ConversationProcessor } from './services/conversationProcessor';
import { ConversationContext } from './types/conversation';

const app = express();
app.use(express.json());

const conversationProcessor = new ConversationProcessor();

/**
 * POST /api/conversation
 * Receives conversation context via cURL
 * - Analyzes last message for image/video generation intent
 * - Builds summary from messages 0 to N-1
 * - Routes to appropriate prompt with context
 */
app.post('/api/conversation', async (req, res) => {
    try {
        const conversationContext: ConversationContext = req.body;
        console.log('conversationContext', conversationContext);
        

        // Validation of the conversation context 
        if (!conversationContext.messages || !Array.isArray(conversationContext.messages)) {
            return res.status(400).json({
                error: 'Invalid request: messages array is required'
            });
        }
        if (conversationContext.messages.length === 0) {
            return res.status(400).json({
                error: 'Invalid request: at least one message is required'
            });
        }

        // Process the conversation using Gemini for intent analysis
        const result = await conversationProcessor.process(conversationContext);
        res.json({
            success: true,
            data: {
                analysis: result.analysis,
                selectedPrompt: {
                    id: result.selectedPrompt.id,
                    name: result.selectedPrompt.name
                },
                summary: result.summary,
                finalPrompt: result.finalPrompt,
                lastMessage: result.lastMessage
            }
        });
    } catch (error) {
        console.error('Error processing conversation:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/conversation/concise
 * Same as /api/conversation but with concise summary for long conversations
 */
app.post('/api/conversation/concise', async (req, res) => {
    try {
        const conversationContext: ConversationContext = req.body;
        const maxMessages = req.body.maxMessages || 5;

        if (!conversationContext.messages || !Array.isArray(conversationContext.messages)) {
            return res.status(400).json({
                error: 'Invalid request: messages array is required'
            });
        }

        if (conversationContext.messages.length === 0) {
            return res.status(400).json({
                error: 'Invalid request: at least one message is required'
            });
        }

        const result = await conversationProcessor.processConcise(conversationContext, maxMessages);

        res.json({
            success: true,
            data: {
                analysis: result.analysis,
                selectedPrompt: {
                    id: result.selectedPrompt.id,
                    name: result.selectedPrompt.name
                },
                summary: result.summary,
                finalPrompt: result.finalPrompt,
                lastMessage: result.lastMessage
            }
        });
    } catch (error) {
        console.error('Error processing conversation:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/prompts
 * List all available prompt templates
 */
app.get('/api/prompts', (_, res) => {
    const router = conversationProcessor.getRouter();
    const prompts = router.listPrompts();

    res.json({
        success: true,
        data: prompts
    });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
});
