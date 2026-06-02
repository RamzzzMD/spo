import sdown from "@/lib/spotidown";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = String(body?.url || "").trim();

    if (!url) {
      return Response.json({ Status: false, Error: "Missing url parameter." }, { status: 400 });
    }

    const result = await sdown.download(url);

    return Response.json(
      { Status: true, Result: result },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return Response.json(
      { Status: false, Error: err.message || "Failed to download from Spotidown." },
      { status: 500 }
    );
  }
}
