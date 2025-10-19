# Fabel Server

AI-powered conversation analysis server that processes multi-user conversations, detects intent, and generates images using Google Gemini.

## Flow

```
POST /api/conversation → Analyze Intent → Build Summary → Route to Prompt → Generate Image (if needed) → Return Result
```

1. **Receive conversation** with messages 0..N
2. **Analyze last message (N)** with Gemini to determine intent (text/image/video)
3. **Summarize messages 0..N-1** for context
4. **Route to appropriate prompt** based on intent
5. **Generate image** if requested using Gemini 2.5 Flash Image
6. **Return** analysis, summary, and generated image

## API Endpoints

- `POST /api/conversation` - Process conversation with full summary
- `POST /api/conversation/concise` - Process with condensed summary (for long threads)
- `GET /api/prompts` - List available prompt templates
- `GET /health` - Health check

## Project Structure

```
src/
├── config/         
├── services/
│   ├── analysis/    
│   ├── generation/  
│   ├── promptRouter.ts
│   ├── contextBuilder.ts
│   └── conversationProcessor.ts 
├── types/           
└── index.ts         
```

## Setup

```bash
# Install dependencies
npm install

# Configure .env
GOOGLE_VERTEX_PROJECT=your-project-id
GOOGLE_VERTEX_LOCATION=us-central1
PORT=3000

# Run
npm run dev
```

## Example Request

```bash
curl -X POST http://localhost:3000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "username": "alice",
        "content": [{"type": "text", "text": "SpaceX launched successfully!"}]
      },
      {
        "role": "user",
        "username": "bob",
        "content": [{"type": "text", "text": "Generate an image of the launch!"}]
      }
    ]
  }'
```
More Sample requests in 
```
./examples/testing_server.sh
```


## Output 
The generated image is in 
```
./src/output
```



<!-- 
## Tech Stack

- **TypeScript** + **Express** - Server framework
- **Google Gemini 2.0 Flash** - Intent analysis
- **Google Gemini 2.5 Flash Image** - Image generation
- **Google Vertex AI** - AI provider -->
