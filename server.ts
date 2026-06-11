import express from "express";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- API Routes ---
  const ANIWATCH_BASE = "https://aniwatch.us.com";
  const MASUKESTIN_BASE = "https://masukestin.com";

  const ANIME_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  };

  // ── Scraper 1: Anime list
  async function fetchAnimeWatchFeed(page = 1, search = "") {
    const url = search
      ? `${ANIWATCH_BASE}/?s=${encodeURIComponent(search)}`
      : `${ANIWATCH_BASE}/genre/hindi-dubbed/page/${page}/`;
    const res = await axios.get(url, { headers: ANIME_HEADERS, timeout: 12000 });
    const $ = cheerio.load(res.data);
    const animes: any[] = [];

    $(".post-cards article, article.item-1, .items .item").each((_, el) => {
      const elem = $(el);
      const linkEl = elem.find("a").first();
      const title = elem.find(".name, .film-name, h2 a, h3 a, .title").first().text().trim() || linkEl.attr("title") || "";
      const link = linkEl.attr("href") || "";
      const cover = elem.find("img").attr("src") || elem.find("img").attr("data-src") || "";
      if (title && link) {
        const slugMatch = link.replace(/\/$/, "").match(/\/([^\/]+)$/);
        const slug = slugMatch ? slugMatch[1] : Buffer.from(link).toString("base64url").slice(0, 30);
        animes.push({ id: slug, token: "aniwatch", title, cover: cover ? `/api/proxy?url=${encodeURIComponent(cover)}` : "", category: "Anime", posted: "Hindi Dubbed", uploader: "AniWatch", rating: "4.7", tags: ["Hindi Dubbed", "Anime"], pageUrl: link });
      }
    });
    return animes;
  }

  // ── Scraper 2: Episode list
  async function fetchAnimeWatchEpisodes(pageUrl: string) {
    const url = pageUrl.startsWith("http") ? pageUrl : `${ANIWATCH_BASE}/${pageUrl}/`;
    const res = await axios.get(url, { headers: ANIME_HEADERS, timeout: 12000 });
    const $ = cheerio.load(res.data);
    const episodes: any[] = [];

    $(".episodios li, .listing.items.lists li, .episodelist li, #episode_by_temp li").each((_, el) => {
      const elem = $(el);
      const linkEl = elem.find("a").first();
      const epLink = linkEl.attr("href") || "";
      const epTitle = linkEl.find(".episodiotitle, .num-epi").text().trim() || linkEl.attr("title") || "";
      const epNum = epTitle.replace(/[^0-9]/g, "") || String(episodes.length + 1);
      if (epLink) {
        const slugMatch = epLink.replace(/\/$/, "").match(/\/([^\/]+)$/);
        episodes.push({ id: slugMatch ? slugMatch[1] : epLink, episode: epNum, title: epTitle || `Episode ${epNum}`, url: epLink });
      }
    });

    if (episodes.length > 1) {
      const first = parseInt(episodes[0].episode || "0");
      const last = parseInt(episodes[episodes.length - 1].episode || "0");
      if (first > last) episodes.reverse();
    }
    return episodes;
  }

  // ── Scraper 3: File code from m3u8
  async function fetchFileCode(episodePageUrl: string) {
    const res = await axios.get(episodePageUrl, { headers: ANIME_HEADERS, timeout: 12000 });
    const $ = cheerio.load(res.data);
    const html = res.data;
    let embedSrc = "";

    $("iframe").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || "";
      if (src.includes("hgcloud") || src.includes("masukestin")) {
        embedSrc = src.startsWith("//") ? "https:" + src : src;
        return false;
      }
    });

    if (!embedSrc) {
      const m = html.match(/(?:hgcloud\.to|masukestin\.com)\/(?:e\/|embed\/)?([a-zA-Z0-9]+)/);
      if (m) embedSrc = `https://hgcloud.to/e/${m[1]}`;
    }
    if (!embedSrc) return null;

    const embedRes = await axios.get(embedSrc, { headers: { ...ANIME_HEADERS, "Referer": episodePageUrl }, timeout: 12000 });
    const embedHtml = embedRes.data;
    const fileCodeMatch = embedSrc.match(/\/e\/([a-zA-Z0-9]+)/) || embedHtml.match(/file_code['":s]+['"]([a-zA-Z0-9]+)['"]/);
    const fileCode = fileCodeMatch ? fileCodeMatch[1] : "";
    const hashMatch = embedHtml.match(/hash['":s]+['"]([a-f0-9\-]+)['"]/i);
    const hash = hashMatch ? hashMatch[1] : "";
    const referer = embedSrc.includes("hgcloud") ? "hgcloud.to" : "masukestin.com";

    return fileCode ? { fileCode, hash, referer } : null;
  }

  async function fetchM3u8(fileCode: string, hash: string, referer: string) {
    const apiUrl = `${MASUKESTIN_BASE}/dl?op=view&file_code=${fileCode}&hash=${hash}&embed=1&referer=${referer}&adb=0&hls4=1`;
    const res = await axios.get(apiUrl, { headers: { ...ANIME_HEADERS, "Referer": `https://masukestin.com/e/${fileCode}`, "Cookie": "tsn=3" }, timeout: 12000 });
    const m = res.data.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
    return m ? m[0] : "";
  }


  // ── ANIWATCH PROXY ──────────────────────────────────────────
  // Proxies aniwatch.us.com pages through our server
  app.get("/watch/*", async (req, res) => {
    try {
      const targetPath = req.path.replace("/watch", "");
      const query = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";
      const targetUrl = `https://aniwatch.us.com${targetPath}${query}`;

      console.log(`[PROXY] Fetching: ${targetUrl}`);

      const response = await axios.get(targetUrl, {
        headers: {
          ...ANIME_HEADERS,
          "Referer": "https://aniwatch.us.com/",
          "Host": "aniwatch.us.com"
        },
        timeout: 15000,
        responseType: "text"
      });

      let html = response.data as string;

      // Rewrite all absolute URLs to go through our proxy
      html = html.replace(/https:\/\/aniwatch\.us\.com\/([^"'\s]*)/g, '/watch/$1');
      // Rewrite relative URLs
      html = html.replace(/href="\/(?!watch|api|static)/g, 'href="/watch/');
      html = html.replace(/action="\/(?!watch|api|static)/g, 'action="/watch/');
      // Rewrite src for scripts/styles
      html = html.replace(/src="\/(?!watch|api|static|\/)/g, 'src="/watch/');

      // Inject base tag for relative resources
      html = html.replace('<head>', '<head><base href="https://aniwatch.us.com/">');

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.send(html);
    } catch (err: any) {
      res.status(500).send(`Proxy error: ${err.message}`);
    }
  });

  // Proxy for aniwatch static assets (CSS, JS, images)
  app.get("/aniwatch-assets/*", async (req, res) => {
    try {
      const assetPath = req.path.replace("/aniwatch-assets", "");
      const targetUrl = `https://aniwatch.us.com${assetPath}`;
      const response = await axios.get(targetUrl, {
        headers: ANIME_HEADERS,
        timeout: 10000,
        responseType: "stream"
      });
      const contentType = response.headers["content-type"] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      response.data.pipe(res);
    } catch (err: any) {
      res.status(502).send("Asset proxy error");
    }
  });

  // --- Image Proxy ---
  app.get("/api/proxy", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) {
        res.status(400).send("No URL provided");
        return;
      }
      const response = await axios.get(url as string, {
        responseType: "stream",
        headers: { "Referer": "https://aniwatch.us.com/" },
        timeout: 10000
      });
      response.data.pipe(res);
    } catch (error: any) {
      res.status(500).send("Proxy error: " + error.message);
    }
  });

  // Route 1: Anime list
  app.get("/api/anime/feed", async (req, res) => {
    try {
      const search = (req.query.search as string) || "";
      const page = req.query.page as string || "1";
      const animes = await fetchAnimeWatchFeed(parseInt(page), search);
      if (animes.length > 0) {
        res.json({ success: true, animes });
      } else {
        res.json({ success: false, error: "Anime list পাওয়া যায়নি।" });
      }
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  });

  // Route 2: Episode list
  app.get("/api/anime/episodes", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        res.status(400).json({ success: false, error: "URL দাও" });
        return;
      }
      const episodes = await fetchAnimeWatchEpisodes(url);
      if (episodes.length > 0) {
        res.json({ success: true, episodes });
      } else {
        res.json({ success: false, episodes: [], error: "Episode পাওয়া যায়নি।" });
      }
    } catch (err: any) {
      res.json({ success: false, episodes: [], error: err.message });
    }
  });

  // Route 3: Stream URL
  app.get("/api/anime/stream", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        res.status(400).json({ success: false, error: "URL দাও" });
        return;
      }
      const fileInfo = await fetchFileCode(url);
      if (!fileInfo) {
        res.json({ success: false, error: "Video embed পাওয়া যায়নি।" });
        return;
      }
      const m3u8Url = await fetchM3u8(fileInfo.fileCode, fileInfo.hash, fileInfo.referer);
      if (m3u8Url) {
        res.json({ success: true, streamUrl: m3u8Url, type: "m3u8" });
      } else {
        res.json({ success: false, error: "Stream URL বের করা সম্ভব হয়নি।" });
      }
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  });

  // Route 4: HLS Proxy (CORS fix for m3u8)
  app.get("/api/anime/hls-proxy", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        res.status(400).send("URL দাও");
        return;
      }
      const response = await axios.get(url, { headers: { ...ANIME_HEADERS, "Referer": "https://masukestin.com/" }, responseType: "text", timeout: 12000 });
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");
      const base = url.substring(0, url.lastIndexOf("/") + 1);
      const rewritten = response.data.replace(/^(?!#)(.+\.ts.*)$/gm, (match: string) => {
        const tsUrl = match.startsWith("http") ? match : base + match;
        return `/api/anime/ts-proxy?url=${encodeURIComponent(tsUrl)}`;
      });
      res.send(rewritten);
    } catch (err: any) {
      res.status(502).send("HLS proxy error: " + err.message);
    }
  });

  // Route 5: TS Segment Proxy
  app.get("/api/anime/ts-proxy", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        res.status(400).send("URL দাও");
        return;
      }
      const response = await axios.get(url, { headers: { ...ANIME_HEADERS, "Referer": "https://masukestin.com/" }, responseType: "stream", timeout: 20000 });
      res.setHeader("Content-Type", "video/MP2T");
      res.setHeader("Access-Control-Allow-Origin", "*");
      response.data.pipe(res);
    } catch (err) {
      res.status(502).send("TS proxy error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
