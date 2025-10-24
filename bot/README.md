# Fabel Bot Server

A TypeScript-based Express server for handling Farcaster webhooks and creating automated frame responses.

## Features

- 🚀 TypeScript with proper ES module support
- 📦 Express server with health checks
- 🔧 Environment variable configuration
- 🔄 Hot reload development mode
- 🏗️ Production-ready build system
- 🎯 Farcaster integration with Neynar SDK

## Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm

## Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your actual API keys:

   ```env
   NEYNAR_API_KEY=your_actual_neynar_api_key
   SIGNER_UUID=your_actual_signer_uuid
   PORT=3000
   NODE_ENV=development
   ```

3. **Development mode (with hot reload):**

   ```bash
   pnpm run dev
   ```

4. **Production build:**
   ```bash
   pnpm run build
   pnpm run start
   ```

## Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build TypeScript to JavaScript
- `pnpm run start` - Run production build
- `pnpm run clean` - Clean build directory

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and timestamp.

### Webhook Handler

```
POST /
```

Processes incoming Farcaster webhook data and creates automated frame responses.

## Environment Variables

| Variable         | Description                      | Required |
| ---------------- | -------------------------------- | -------- |
| `NEYNAR_API_KEY` | Your Neynar API key              | ✅       |
| `SIGNER_UUID`    | Signer UUID for publishing casts | ✅       |
| `PORT`           | Server port (default: 3000)      | ❌       |
| `NODE_ENV`       | Environment mode                 | ❌       |

## Setting Up Webhooks

### Creating a Neynar Webhook

1. Go to the [Neynar Dashboard](https://dev.neynar.com/)
2. Navigate to the [Webhooks tab](https://dev.neynar.com/webhook)
3. Click "New Webhook"
4. Set your target URL (use ngrok for local development)
5. Configure the events you want to listen to
6. Save the webhook

### Local Development with ngrok

For local development, use ngrok to expose your local server:

```bash
# Install ngrok if you haven't already
# https://ngrok.com/download

# Expose your local server
ngrok http 3000
```

Use the ngrok URL as your webhook target URL in the Neynar dashboard.

## Getting API Credentials

### Neynar API Key

1. Go to the [Neynar Dashboard](https://dev.neynar.com/)
2. Copy your API key from the overview section

### Signer UUID

1. Go to the [App section](https://dev.neynar.com/app) in the Neynar dashboard
2. Copy the signer UUID for your account

## Development

### Project Structure

```
bot/
├── index.ts              # Main server file
├── utils/
│   └── neynarClient.ts   # Neynar SDK configuration
├── dist/                 # Compiled JavaScript (after build)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── .env                  # Environment variables (create from .env.example)
```

### TypeScript Configuration

The project uses modern TypeScript configuration with:

- ES2022 target for modern Node.js features
- ES modules with proper file extensions
- Strict type checking
- Source maps and declarations for debugging
- Clean build output in `dist/` directory

### Development Workflow

1. Make changes to TypeScript files
2. The dev server will automatically restart on file changes
3. Build and test production version before deployment

## Deployment

1. **Build the project:**

   ```bash
   pnpm run build
   ```

2. **Set production environment variables**

3. **Start the production server:**
   ```bash
   pnpm run start
   ```

## Troubleshooting

### Common Issues

1. **"tsx not found" error:**

   - Make sure all dependencies are installed: `pnpm install`

2. **Environment variable errors:**

   - Ensure `.env` file exists and contains required variables
   - Check that `dotenv` is properly installed

3. **Module resolution errors:**

   - Rebuild the project: `pnpm run build`
   - Ensure file extensions are included in imports for ES modules

4. **Port already in use:**
   - Change the PORT in your `.env` file
   - Or kill the process using the port: `pkill -f "node dist/index.js"`

### Health Check

Test if the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-24T11:27:44.832Z",
  "service": "fabel-bot"
}
```

## Testing the Bot

1. Start your server (development or production)
2. Set up ngrok if testing locally
3. Configure your Neynar webhook with the correct URL
4. Create a cast on Farcaster that triggers your webhook
5. Check server logs for webhook processing

The bot will automatically reply to triggering casts with a personalized frame.

## License

See the main project LICENSE file.
