import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const img = searchParams.get("img");
  const name = searchParams.get("name") ?? "Fabel NFT";
  const description =
    searchParams.get("description") ?? "Minted via Fabel mini-app";

  if (!img) {
    return NextResponse.json(
      { error: "Missing required query param: img" },
      { status: 400 },
    );
  }

  try {
    // Validate URL format (best-effort)
    new URL(img);
  } catch {
    return NextResponse.json(
      { error: "Invalid img URL provided" },
      { status: 400 },
    );
  }

  const metadata = {
    name,
    description,
    image: img,
    attributes: [],
  };

  return NextResponse.json(metadata, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
    },
  });
}

