const AUDIO_EXTS = ["mp3", "m4a", "aac", "ogg", "opus", "wav", "flac"];

const BLOCKED_AUDIO_WORDS = [
  "preview",
  "urlpreview",
  "audioPreview",
  "mp3-preview",
  "snippet",
  "sample"
];

const BLOCKED_IMAGE_WORDS = [
  "thumb",
  "thumbnail",
  "cover",
  "poster",
  "image",
  "avatar",
  "artwork"
];

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

function isBlockedPreview(item) {
  const url = item.url.toLowerCase();
  const path = item.path.toLowerCase();

  if (BLOCKED_AUDIO_WORDS.some((word) => url.includes(word.toLowerCase()))) {
    return true;
  }

  if (BLOCKED_AUDIO_WORDS.some((word) => path.includes(word.toLowerCase()))) {
    return true;
  }

  if (url.includes("p.scdn.co/mp3-preview")) return true;
  if (url.includes("scdn.co/mp3-preview")) return true;
  if (url.includes("spotifycdn") && url.includes("preview")) return true;

  return false;
}

function isImageAsset(item) {
  const url = item.url.toLowerCase();
  const path = item.path.toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(item.ext)) {
    return true;
  }

  if (BLOCKED_IMAGE_WORDS.some((word) => path.includes(word))) {
    return true;
  }

  if (
    url.includes(".jpg") ||
    url.includes(".jpeg") ||
    url.includes(".png") ||
    url.includes(".webp") ||
    url.includes(".gif")
  ) {
    return true;
  }

  return false;
}

function scoreAudio(item) {
  if (isBlockedPreview(item)) return -9999;
  if (isImageAsset(item)) return -9999;

  let score = 0;

  const url = item.url.toLowerCase();
  const path = item.path.toLowerCase();

  if (AUDIO_EXTS.includes(item.ext)) score += 150;

  if (path.includes("audio")) score += 120;
  if (path.includes("music")) score += 100;
  if (path.includes("sound")) score += 80;

  if (path.includes("download")) score += 70;
  if (path.includes("media")) score += 60;
  if (path.includes("url")) score += 20;

  if (path.includes("mp3")) score += 100;
  if (path.includes("m4a")) score += 100;
  if (path.includes("opus")) score += 100;
  if (path.includes("aac")) score += 90;
  if (path.includes("ogg")) score += 80;

  if (url.includes(".mp3")) score += 150;
  if (url.includes(".m4a")) score += 150;
  if (url.includes(".aac")) score += 140;
  if (url.includes(".opus")) score += 140;
  if (url.includes(".ogg")) score += 120;
  if (url.includes(".flac")) score += 120;
  if (url.includes(".wav")) score += 100;

  if (url.includes("audio")) score += 60;
  if (url.includes("music")) score += 50;

  if (url.includes(".mp4")) score -= 80;
  if (url.includes(".webm")) score -= 80;
  if (url.includes(".m3u8")) score -= 80;

  return score;
}

function pickBestAudio(data) {
  const candidates = collectMedia(data)
    .map((item) => ({
      ...item,
      score: scoreAudio(item)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0] || null;
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
    throw new Error("Full MP3/audio tidak ditemukan. Sistem tidak memakai urlpreview.");
  }

  return {
    ...track,
    audioUrl: `/api/media-proxy?url=${encodeURIComponent(best.url)}`,
    sourceAudioUrl: best.url,
    isFullAudio: true
  };
}
