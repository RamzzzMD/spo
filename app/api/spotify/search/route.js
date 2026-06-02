import { spotifySearch } from "@/lib/spotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanLimit(value) {
  const n = Number(value || 5);
  if (!Number.isFinite(n)) return 5;
  return Math.max(1, Math.min(Math.floor(n), 10));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q = String(searchParams.get("q") || "").trim();
  const limit = cleanLimit(searchParams.get("limit"));

  try {
    const result = await spotifySearch(q, limit);

    return Response.json(
      {
        Status: true,
        Code: 200,
        Query: q,
        Result: result,
        Error: null
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (err) {
    return Response.json(
      {
        Status: false,
        Code: 500,
        Query: q,
        Result: [],
        Error: err.message || "Spotify search failed"
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));

  const q = String(body?.q || body?.query || "").trim();
  const limit = cleanLimit(body?.limit);

  try {
    const result = await spotifySearch(q, limit);

    return Response.json({
      Status: true,
      Code: 200,
      Query: q,
      Result: result,
      Error: null
    });
  } catch (err) {
    return Response.json({
      Status: false,
      Code: 500,
      Query: q,
      Result: [],
      Error: err.message || "Spotify search failed"
    });
  }
}
