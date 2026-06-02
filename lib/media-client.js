const AUDIO_EXTS = ["mp3", "m4a", "aac", "ogg", "opus", "wav", "flac"];

function getExt(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const clean = path.split("?")[0].split("#")[0];
    const ext = clean.includes(".") ? clean.split(".").pop() : "";

    return ext.replace(/[^a-z0-9]/g, "");
  } catch {
    return "";
  }
}

function collectMedia(value, path = [], out = []) {
  if (!value) return out;

  if (typeof value === "string" && /^https?:\/\//i.test(value)) {
    out.push({
      url: value,
      path: path.join(".").toLowerCase(),
      ext: getExt(value)
    });

    return out;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectMedia(item, [...path, String(index)], out);
    });

    return out;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      collectMedia(item, [...path, key], out);
    });
  }

  return out;
}

function scoreAudio(item) {
  let score = 0;

  const url = item.url.toLowerCase();
  const path = item.path.toLowerCase();

  if (AUDIO_EXTS.includes(item.ext)) score += 100;
  if (path.includes("audio")) score += 50;
  if (path.includes("music")) score += 40;
  if (path.includes("mp3")) score += 35;
  if (path.includes("m4a")) score += 35;
  if (path.includes("opus")) score += 35;
  if (url.includes(".mp3")) score += 30;
  if (url.includes(".m4a")) score += 30;
  if (url.includes(".opus")) score += 30;
  if (url.includes("audio")) score += 20;

  if (url.includes(".jpg")) score -= 100;
  if (url.includes(".jpeg")) score -= 100;
  if (url.includes(".png")) score -= 100;
  if (url.includes(".webp")) score -= 100;
  if (url.includes(".mp4")) score -= 20;

  return score;
}

function pickBestAudio(data) {
  const items = collectMedia(data)
    .map((item) => ({
      ...item,
      score: scoreAudio(item)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return items[0] || null;
}

export async function resolveFullAudioTrack(track) {
  if (!track?.url) {
    throw new Error("Track URL tidak tersedia.");
  }

  const res = await fetch("/api/downr", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      url: track.url
    })
  });

  const json = await res.json();

  if (!json?.Status) {
    throw new Error(json?.Error || "Full audio tidak ditemukan.");
  }

  const best = pickBestAudio(json.Result);

  if (!best?.url) {
    throw new Error("Full audio tidak ditemukan dari response downloader.");
  }

  const audioUrl = `/api/media-proxy?url=${encodeURIComponent(best.url)}`;

  return {
    ...track,
    audioUrl,
    sourceAudioUrl: best.url,
    isFullAudio: true
  };
}
