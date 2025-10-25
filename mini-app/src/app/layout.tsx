import "~/app/globals.css";
import { Providers } from "~/app/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>Fabel - Making Fabels</title>
        <meta
          name="description"
          content="Mint NFTs with Fabel - A beautiful Farcaster mini app"
        />
      </head>
      <body className="dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
