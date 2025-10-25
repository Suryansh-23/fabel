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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
