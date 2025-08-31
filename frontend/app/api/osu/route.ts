import { NextRequest, NextResponse } from 'next/server';
import * as JSZip from 'jszip';

const OSU_CLIENT_ID = process.env.OSU_CLIENT_ID;
const OSU_CLIENT_SECRET = process.env.OSU_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const beatmapId = searchParams.get('beatmapId');
  const action = searchParams.get('action') || 'metadata'; // Default to 'metadata'

  if (!beatmapId) {
    return NextResponse.json({ error: 'Missing beatmapId' }, { status: 400 });
  }

  if (!OSU_CLIENT_ID || !OSU_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing osu! API credentials' },
      { status: 500 }
    );
  }

  try {
    // Get access token
    const tokenResponse = await fetch('https://osu.ppy.sh/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: OSU_CLIENT_ID,
        client_secret: OSU_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'public',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get osu! token: ${tokenResponse.status} - ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();

    // Fetch beatmap metadata to get the beatmapset_id
    const beatmapResponse = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!beatmapResponse.ok) {
      const errorText = await beatmapResponse.text();
      throw new Error(`Failed to fetch beatmap metadata: ${beatmapResponse.status} - ${errorText}`);
    }

    const metadata = await beatmapResponse.json();
    const setId = metadata.beatmapset_id;

    if (action === 'metadata') {
      return NextResponse.json(metadata);
    }
    
    // highlight-start
    console.log(`[Log] Found Beatmapset ID: ${setId} for Beatmap ID: ${beatmapId}. Starting download process.`);
    // highlight-end
    
    // Attempt to download from multiple mirrors with fallbacks
    const mirrors = [
      { name: 'beatconnect', url: `https://beatconnect.io/b/${setId}/` },
      { name: 'beatconnect', url: `https://beatconnect.io/b/download/${setId}` },
      { name: 'nerinyan', url: `https://nerinyan.moe/d/${setId}?nv=1` },
      { name: 'catboy', url: `https://catboy.best/d/${setId}?nv=1` },
    ];

    let oszResponse: Response | null = null;
    let successfulMirror = '';

    for (const mirror of mirrors) {
      try {
        // highlight-start
        console.log(`[Log] [Set ID: ${setId}] Attempting download from mirror: ${mirror.name}`);
        // highlight-end
        const response = await fetch(mirror.url, {
          headers: {
            'User-Agent': 'CalmRhythmGame/1.0 (contact: your.email@example.com)',
          },
        });
        if (response.ok) {
          // highlight-start
          console.log(`[Log] [Set ID: ${setId}] Download successful from ${mirror.name}.`);
          // highlight-end
          oszResponse = response;
          successfulMirror = mirror.name;
          break; // Exit the loop on first successful download
        } else {
          // highlight-start
          console.warn(`[Log] [Set ID: ${setId}] Download from ${mirror.name} failed with status: ${response.status}. Trying next mirror.`);
          // highlight-end
        }
      } catch (e) {
        console.error(`[Log] [Set ID: ${setId}] Network error fetching from ${mirror.name}:`, e);
      }
    }

    if (!oszResponse) {
      throw new Error('Failed to download .osz file from all available mirrors.');
    }

    const oszBuffer = await oszResponse.arrayBuffer();

    if (action === 'download') {
      return new NextResponse(oszBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${setId}.osz"`,
          'Content-Length': oszBuffer.byteLength.toString(),
        },
      });
    }

    // const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(oszBuffer);

    let osuFileName: string | undefined;
    let audioFileName: string | undefined;
    let candidateFile: string | undefined;

    for (const filename in zip.files) {
      if (filename.toLowerCase().endsWith('.osu')) {
        console.log("[Log] Found .osu:", filename);

        const content = await zip.file(filename)!.async('string');

        const idMatch = content.match(/BeatmapID:\s*(\d+)/);
        const setIdMatch = content.match(/BeatmapSetID:\s*(-?\d+)/);

        if (idMatch && idMatch[1] === beatmapId) {
          // exact difficulty match
          osuFileName = filename;
        } else if (!candidateFile && setIdMatch && setIdMatch[1] === String(setId)) {
          // fallback candidate: same setId
          candidateFile = filename;
        } else if (!candidateFile) {
          // ultimate fallback: just take the first .osu we see
          candidateFile = filename;
        }

        if (osuFileName) {
          const audioMatch = content.match(/AudioFilename:\s*(.+)/i);
          if (audioMatch) audioFileName = audioMatch[1].trim();
          break;
        }
      }
    }

    if (!osuFileName && candidateFile) {
      // use fallback if no exact match
      osuFileName = candidateFile;
      const content = await zip.file(candidateFile)!.async('string');
      const audioMatch = content.match(/AudioFilename:\s*(.+)/i);
      if (audioMatch) audioFileName = audioMatch[1].trim();
    }

    if (!osuFileName) {
      throw new Error("No .osu file found in the beatmapset (this should never happen!)");
    }


    if (action === 'beatmap') {
      const content = await zip.file(osuFileName)!.async('string');
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } else if (action === 'audio') {
      if (!audioFileName) {
        throw new Error('No AudioFilename found in .osu file');
      }
      const audioFile = zip.file(audioFileName);
      if (!audioFile) {
        throw new Error('Audio file not found in zip');
      }
      const audioBuffer = await audioFile.async('arraybuffer');
      // Detect actual audio format from the file
      const audioExtension = audioFileName.toLowerCase().split('.').pop();
      const contentType = audioExtension === 'mp3' ? 'audio/mpeg' : 
                        audioExtension === 'ogg' ? 'audio/ogg' : 'audio/mpeg';

      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': audioBuffer.byteLength.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600'
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}