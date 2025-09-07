import { NextRequest, NextResponse } from "next/server";

const OSU_CLIENT_ID = process.env.OSU_CLIENT_ID;
const OSU_CLIENT_SECRET = process.env.OSU_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const beatmapId = searchParams.get("beatmapId");
  const action = searchParams.get("action"); // 'metadata' or 'download'

  if (!beatmapId) {
    return NextResponse.json({ error: "Missing beatmapId" }, { status: 400 });
  }

  if (!OSU_CLIENT_ID || !OSU_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Server configuration error: Missing osu! API credentials" },
      { status: 500 }
    );
  }

  try {
    // Get access token
    const tokenResponse = await fetch("https://osu.ppy.sh/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: OSU_CLIENT_ID,
        client_secret: OSU_CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "public",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(
        `Failed to get osu! token: ${tokenResponse.status} - ${errorText}`
      );
    }

    const { access_token } = await tokenResponse.json();

    // Fetch metadata
    const beatmapResponse = await fetch(
      `https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!beatmapResponse.ok) {
      const errorText = await beatmapResponse.text();
      throw new Error(
        `Failed to fetch beatmap metadata: ${beatmapResponse.status} - ${errorText}`
      );
    }

    const metadata = await beatmapResponse.json();

    if (action === "download") {
      const setId = metadata.beatmapset_id;
      const mirror = searchParams.get("mirror");
      let downloadUrl: string;

      // Prioritize working mirrors (no-video where possible)
      if (mirror === "nerinyan") {
        downloadUrl = `https://nerinyan.moe/d/${setId}?nv=1`; // nv=1 for no video
      } else if (mirror === "catboy") {
        downloadUrl = `https://catboy.best/d/${setId}?nv=1`;
      } else {
        downloadUrl = `https://beatconnect.io/b/${setId}/`; // Default to beatconnect (works, no-video param not needed)
      }

      const oszResponse = await fetch(downloadUrl, {
        headers: {
          "User-Agent": "CalmRhythmGame/1.0 (contact: your.email@example.com)",
        },
      });

      if (!oszResponse.ok) {
        const errorText = await oszResponse.text();
        throw new Error(
          `Failed to download .osz from ${mirror || "beatconnect"}: ${
            oszResponse.status
          } - ${errorText}`
        );
      }

      // Get the buffer and send as binary response
      const oszBuffer = await oszResponse.arrayBuffer();
      return new NextResponse(oszBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${setId}.osz"`,
          "Content-Length": oszBuffer.byteLength.toString(),
        },
      });
    } else {
      // Return metadata by default
      return NextResponse.json(metadata);
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
