"use strict";

const express = require("express");
const youtubedl = require("youtube-dl-exec");

const PORT = parseInt(process.env.PORT, 10) || 3939;
const TOKEN = process.env.API_TOKEN || "change-me";
const CACHE_TTL_MS = 5 * 60 * 60 * 1000;
const CACHE_SAFETY_MS = 60 * 1000;
const MAX_CACHE_SIZE = 512;
const RESOLVE_TIMEOUT_MS = 15000;

const cache = new Map();

function extractVideoId(raw) {
    if (typeof raw !== "string" || raw.length === 0 || raw.length > 400) return null;
    let url;
    try {
        url = new URL(raw);
    } catch (_) {
        return null;
    }
    const host = url.hostname.toLowerCase();
    if (host === "youtu.be") {
        return sanitizeId(url.pathname.slice(1));
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
        if (url.pathname === "/watch") return sanitizeId(url.searchParams.get("v"));
        if (url.pathname.startsWith("/shorts/")) return sanitizeId(url.pathname.split("/")[2]);
        if (url.pathname.startsWith("/embed/")) return sanitizeId(url.pathname.split("/")[2]);
        if (url.pathname.startsWith("/v/")) return sanitizeId(url.pathname.split("/")[2]);
    }
    return null;
}

function sanitizeId(id) {
    if (typeof id !== "string") return null;
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;
    return id;
}

function pruneCache() {
    if (cache.size <= MAX_CACHE_SIZE) return;
    const now = Date.now();
    for (const [key, entry] of cache) {
        if (entry.expiresAt <= now) cache.delete(key);
    }
    if (cache.size <= MAX_CACHE_SIZE) return;
    const overflow = cache.size - MAX_CACHE_SIZE;
    let removed = 0;
    for (const key of cache.keys()) {
        if (removed >= overflow) break;
        cache.delete(key);
        removed++;
    }
}

function pickBestAudio(formats) {
    if (!Array.isArray(formats)) return null;
    const audios = formats.filter((f) =>
        f && typeof f.url === "string"
        && f.acodec && f.acodec !== "none"
        && (!f.vcodec || f.vcodec === "none")
    );
    audios.sort((a, b) => (b.abr || 0) - (a.abr || 0));
    return audios[0] || null;
}

async function resolveVideo(videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await Promise.race([
        youtubedl(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            noPlaylist: true,
            preferFreeFormats: true,
            format: "bestaudio",
            addHeader: ["referer:youtube.com", "user-agent:Mozilla/5.0"],
        }),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("resolve-timeout")), RESOLVE_TIMEOUT_MS)
        ),
    ]);

    let streamUrl = typeof info.url === "string" ? info.url : null;
    if (!streamUrl) {
        const best = pickBestAudio(info.formats);
        streamUrl = best && best.url;
    }
    if (!streamUrl) throw new Error("no-audio-url");

    return {
        streamUrl,
        title: typeof info.title === "string" ? info.title : "",
        durationSec: parseInt(info.duration, 10) || 0,
    };
}

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
    if (req.path === "/health") return next();
    const token = req.header("x-api-token");
    if (!token || token !== TOKEN) {
        return res.status(401).json({ ok: false, error: "unauthorized" });
    }
    return next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/resolve", async (req, res) => {
    const raw = typeof req.query.url === "string" ? req.query.url : "";
    const videoId = extractVideoId(raw);
    if (!videoId) {
        return res.status(400).json({ ok: false, error: "invalid-url" });
    }

    const now = Date.now();
    const cached = cache.get(videoId);
    if (cached && cached.expiresAt - CACHE_SAFETY_MS > now) {
        return res.json({
            ok: true,
            cached: true,
            videoId,
            streamUrl: cached.data.streamUrl,
            title: cached.data.title,
            durationSec: cached.data.durationSec,
        });
    }

    try {
        const data = await resolveVideo(videoId);
        cache.set(videoId, { data, expiresAt: now + CACHE_TTL_MS });
        pruneCache();
        return res.json({ ok: true, cached: false, videoId, ...data });
    } catch (err) {
        const message = err && err.message ? String(err.message).slice(0, 240) : "unknown";
        console.error("[yt-resolver] resolve error:", message);
        return res.status(502).json({ ok: false, error: "resolve-failed", message });
    }
});

app.use((_req, res) => res.status(404).json({ ok: false, error: "not-found" }));

app.listen(PORT, () => {
    console.log(`[yt-resolver] listening on :${PORT}`);
});