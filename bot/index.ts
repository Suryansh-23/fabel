import { NeynarFrameCreationReqBody } from "@neynar/nodejs-sdk/build/api";
import express from "express";
import neynarClient from "./utils/neynarClient";

const app = express();
const port = process.env.PORT || 3000;
const signer = process.env.SIGNER_UUID;
if (!signer) {
  throw new Error("Make sure you set SIGNER_UUID in your .env file");
}

// Middleware
app.use(express.text());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "fabel-bot",
  });
});

app.post("/", async (req, res) => {
  try {
    const hookData = req.body;
    console.log("Received hook data:", JSON.stringify(hookData, null, 2));

    // const creationRequest = {
    //   name: "gm",
    //   pages: [
    //     {
    //       image: {
    //         url: "https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeifjdrcl2p4kmfv2uy3i2wx2hlxxn4hft3apr37lctiqsfdixjy3qi&w=1920&q=75",
    //         aspect_ratio: "1.91:1",
    //       },
    //       title: "Neynar NFT minting frame",
    //       buttons: [
    //         {
    //           action_type: "mint",
    //           title: "Mint",
    //           index: 1,
    //           next_page: {
    //             mint_url:
    //               "eip155:8453:0x23687d295fd48db3e85248b734ea9e8fb3fced27:1",
    //           },
    //         },
    //       ],
    //       input: {
    //         text: {
    //           enabled: false,
    //         },
    //       },
    //       uuid: "gm",
    //       version: "vNext",
    //     },
    //   ],
    // };

    const creationRequest = {
      signerUuid: signer,
      name: `gm ${hookData.data.author.username}`,
      pages: [
        {
          image: {
            url: "https://moralis.io/wp-content/uploads/web3wiki/638-gm/637aeda23eca28502f6d3eae_61QOyzDqTfxekyfVuvH7dO5qeRpU50X-Hs46PiZFReI.jpeg",
            aspect_ratio: "1:1",
          },
          title: "Page title",
          buttons: [],
          input: {
            text: {
              enabled: false,
            },
          },
          uuid: "gm",
          version: "vNext",
        },
      ],
    };
    const reply = await neynarClient.publishCast({
      signerUuid: signer,
      text: `gm ${hookData.data.author.username}`,
      embeds: [
        {
          url: "https://moralis.io/wp-content/uploads/web3wiki/638-gm/637aeda23eca28502f6d3eae_61QOyzDqTfxekyfVuvH7dO5qeRpU50X-Hs46PiZFReI.jpeg",
        },
      ],
      parent: hookData.data.hash,
    });
    // console.log("Published frame:", JSON.stringify(frame, null, 2));

    // if (!process.env.SIGNER_UUID) {
    //   throw new Error("Make sure you set SIGNER_UUID in your .env file");
    // }

    // const reply = await neynarClient.publishCast({
    //   signerUuid: process.env.SIGNER_UUID,
    //   text: `gm ${hookData.data.author.username}`,
    //   embeds: [
    //     {
    //       url: frame.cast.,
    //     },
    //   ],
    //   parent: hookData.data.hash,
    // });
    console.log("Published reply cast:", JSON.stringify(reply, null, 2));

    res.send(`Replied to the cast with hash: ${reply.cast.hash}`);
  } catch (e: any) {
    console.log("Error handling request:", e);
    console.log(JSON.stringify(req.body, null, 2));
    res.status(500).send(e.message);
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("\n👋 Received SIGINT. Graceful shutdown...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Received SIGTERM. Graceful shutdown...");
  process.exit(0);
});
