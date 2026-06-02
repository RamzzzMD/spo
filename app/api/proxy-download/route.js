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

function safeFilename(input, fallback = "ranzz-media") {
  const clean = String(input || "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  return clean || fallback;
}

function inferFilename(url, contentType, name) {
  const parsed = new URL(url);
  const pathname = decodeURIComponent(parsed.pathname || "");
  const raw = pathname.split("/").filter(Boolean).pop();

  let filename = safeFilename(name || raw || "ranzz-media");

  if (!filename.includes(".")) {
    const extMap = {
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/quicktime": "mov",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "audio/mpeg": "mp3",
      "audio/mp3": "mp3",
      "audio/ogg": "ogg",
      "audio/opus": "opus",
      "audio/wav": "wav",
      "audio/mp4": "m4a"
    };

    const ext = extMap[String(contentType || "").split(";")[0].toLowerCase()];

    if (ext) filename += `.${ext}`;
  }

  return filename;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const rawUrl = String(searchParams.get("url") || "").trim();
    const name = String(searchParams.get("name") || "").trim();

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

    const upstream = await fetch(parsed.toString(), {
      headers: {
        "user-agent": UA,
        accept: "*/*"
      },
      cache: "no-store",
      redirect: "follow"
    });

    if (!upstream.ok || !upstream.body) {
      return Response.json(
        {
          Status: false,
          Code: upstream.status,
          Error: `Failed to fetch media. HTTP ${upstream.status}`
        },
        {
          status: 502
        }
      );
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    const contentLength = upstream.headers.get("content-length");

    const filename = inferFilename(parsed.toString(), contentType, name);

    const headers = new Headers();

    headers.set("content-type", contentType);
    headers.set("cache-control", "no-store");
    headers.set(
      "content-disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
        filename
      )}`
    );

    if (contentLength) {
      headers.set("content-length", contentLength);
    }

    return new Response(upstream.body, {
      status: 200,
      headers
    });
  } catch (err) {
    return Response.json(
      {
        Status: false,
        Error: err.message || "Proxy download failed."
      },
      {
        status: 500
      }
    );
  }
}
