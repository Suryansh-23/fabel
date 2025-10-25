# 🎨 Fabel - Beautiful NFT Minting Mini App

A stunning Farcaster Mini App for minting NFTs with modern design and seamless user experience.

Built with [Next.js](https://nextjs.org/) + TypeScript + React + Tailwind CSS.

## ✨ Features

- 🎨 **Beautiful Design**: Modern gradient-based UI inspired by the fabel brand
- 🌙 **Dark Mode**: Elegant dark theme optimized for Farcaster
- 📱 **Responsive**: Perfect experience across all devices
- ⚡ **Fast**: Optimized performance with Next.js 15
- 🔗 **Blockchain Integration**: Seamless Base/Base Sepolia support
- 🖼️ **NFT Minting**: Easy NFT minting with Farcaster wallet
- 🎯 **TypeScript**: Full type safety throughout

## 🚀 Quick Start

1. **Clone and setup**:

   ```bash
   cd fabel/mini-app
   npm install
   ```

2. **Environment setup**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

## 🎨 Design System

Fabel uses a modern design system with:

### Color Palette

- **Primary**: Fabel Purple (`#8B5CF6`)
- **Secondary**: Fabel Blue (`#3B82F6`)
- **Accent**: Fabel Orange (`#F97316`)
- **Highlight**: Fabel Pink (`#EC4899`)

### Design Tokens

- **Gradients**: Beautiful multi-stop gradients across the fabel color spectrum
- **Glass Effects**: Modern glassmorphism with backdrop blur
- **Shadows**: Subtle depth with colored shadows
- **Animations**: Smooth micro-interactions and loading states

### Components

- **Buttons**: Four variants (primary, secondary, outline, ghost)
- **Cards**: Glass, gradient, and standard variants
- **Loading**: Animated spinners and full-screen states
- **Status**: Connection and network status badges

### Importing the CLI

To invoke the CLI directly in JavaScript, add the npm package to your project and use the following import statement:

```{javascript}
import { init } from '@neynar/create-farcaster-mini-app';
```

## Deploying to Vercel

For projects that have made minimal changes to the quickstart template, deploy to vercel by running:

```{bash}
npm run deploy:vercel
```

## Building for Production

To create a production build, run:

```{bash}
npm run build
```

The above command will generate a `.env` file based on the `.env.local` file and user input. Be sure to configure those environment variables on your hosting platform.

## NFT Mint Endpoint (server-side)

This template includes a simple server-side NFT mint endpoint that can mint an ERC-721 token on Base to the authenticated Farcaster user’s wallet:

- `GET /api/mint?img=<encodedImageUrl>&name=<optional>&description=<optional>`
  - Mints to the user’s Farcaster wallet address (primary verified address → first verified → custody address).
  - Redirects to `/mint/success` with a preview and BaseScan links.

You must configure these environment variables for minting to work (defaults target Base Sepolia):

- `NFT_CONTRACT_ADDRESS` – ERC-721 contract address on Base (must support `mintTo(address,string)` or `safeMint(address,string)`).
- `NFT_MINTER_PRIVATE_KEY` – Private key for the deployer/minter wallet (server-side key; do not expose to client).
- `NFT_RPC_URL` – HTTPS RPC URL for the target network (e.g., Alchemy/Ankr/Infura Base endpoint).
- `NFT_CHAIN_ID` – `84532` for Base Sepolia (default) or `8453` for Base mainnet.

Metadata is served from `GET /api/metadata?img=<url>&name=<optional>&description=<optional>` and used as the tokenURI when minting.

## UI Mint Flow (Farcaster Wallet)

Link users to the mint UI screen which shows a preview and lets them mint using the Farcaster wallet inside the Mini App client:

- Route: `/mint?img=<encodedImageUrl>[&name=...&description=...][&contract=0x...]`
- Defaults: Base Sepolia (84532). Uses `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` if `contract` is not provided.
- The page attempts to call a public mint function on your ERC-721 using the Farcaster wallet via wagmi’s Farcaster connector.

Client-side env required:

- `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` – ERC‑721 contract address for public mint.
- `NEXT_PUBLIC_NFT_CHAIN_ID` – `84532` for Base Sepolia (default) or `8453` for Base mainnet.

Notes:

- The UI tries `mint(string)` first, then falls back to `safeMint(address,string)` and `mintTo(address,string)` if available.
- TokenURI comes from `/api/metadata` built from the `img` passed to the page.

## Developing Script Locally

This section is only for working on the script and template. If you simply want to create a mini app and _use_ the template, this section is not for you.

### Recommended: Using `npm link` for Local Development

To iterate on the CLI and test changes in a generated app without publishing to npm:

1. In your installer/template repo (this repo), run:

   ```bash
   npm link
   ```

   This makes your local version globally available as a symlinked package.

1. Now, when you run:
   ```bash
   npx @neynar/create-farcaster-mini-app
   ```
   ...it will use your local changes (including any edits to `init.js` or other files) instead of the published npm version.

### Alternative: Running the Script Directly

You can also run the script directly for quick iteration:

```bash
node ./bin/index.js
```

However, this does not fully replicate the npx install flow and may not catch all issues that would occur in a real user environment.

### Environment Variables and Scripts

If you update environment variable handling, remember to replicate any changes in the `dev`, `build`, and `deploy` scripts as needed. The `build` and `deploy` scripts may need further updates and are less critical for most development workflows.
