import { downr } from "@/lib/downr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const url = String(body?.url || "").trim();

  const result = await downr(url);

  return Response.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = String(searchParams.get("url") || "").trim();

  const result = await downr(url);

  return Response.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
