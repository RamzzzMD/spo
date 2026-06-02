import dns from "node:dns/promises";
import net from "node:net";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

function isPrivateIp(ip) {
  if (!ip) return true;

  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;

  const parts = ip.split(".").map(Number);

  if (parts.length === 4) {
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 0) return true;
  }

  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) {
    return true;
  }

  return false;
}

async function assertSafeUrl(rawUrl) {
  const parsed = new URL(rawUrl);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are allowed.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0"
  ) {
    throw new Error("Private host is not allowed.");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error("Private IP is not allowed.");
    }

    return parsed;
  }

  const records = await dns.lookup(hostname, {
    all: true,
    verbatim: true
  });

  if (!records.length) {
    throw new Error("Unable to resolve host.");
  }

  if (records.some((item) => isPrivateIp(item.address))) {
    throw new Error("Private network target is not allowed.");
  }

  return parsed;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const rawUrl = String(searchParams.get("url") || "").trim();

    if (!rawUrl) {
      return Response.json(
        {
          Status: false,
          Error: "Missing url parameter."
        },
        {
          status: 400
        }
      );
    }

    const parsed = await assertSafeUrl(rawUrl);
    const range = req.headers.get("range");

    const upstream = await fetch(parsed.toString(), {
      headers: {
        "user-agent": UA,
        accept: "*/*",
        ...(range ? { range } : {})
      },
      cache: "no-store",
      redirect: "follow"
    });

    if (!upstream.ok && upstream.status !== 206) {
      return Response.json(
        {
          Status: false,
          Code: upstream.status,
          Error: `Failed to stream media. HTTP ${upstream.status}`
        },
        {
          status: 502
        }
      );
    }

    const headers = new Headers();

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    headers.set("content-type", contentType);
    headers.set("cache-control", "no-store");
    headers.set("accept-ranges", upstream.headers.get("accept-ranges") || "bytes");
    headers.set("content-disposition", "inline");

    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");

    if (contentLength) headers.set("content-length", contentLength);
    if (contentRange) headers.set("content-range", contentRange);

    return new Response(upstream.body, {
      status: upstream.status,
      headers
    });
  } catch (err) {
    return Response.json(
      {
        Status: false,
        Error: err.message || "Media proxy failed."
      },
      {
        status: 500
      }
    );
  }
}
