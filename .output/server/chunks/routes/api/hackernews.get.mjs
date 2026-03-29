import { d as defineEventHandler, g as getQuery, c as createError } from '../../nitro/nitro.mjs';
import { e as extractDomain, g as generateId } from '../../_/utils.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const HN_BASE = "https://hacker-news.firebaseio.com/v0";
async function fetchHackerNews(keywords, limit = 10) {
  const idsRes = await fetch(`${HN_BASE}/topstories.json`);
  if (!idsRes.ok) throw new Error(`HackerNews top stories \u5931\u6557: ${idsRes.status}`);
  const allIds = await idsRes.json();
  const topIds = allIds.slice(0, 60);
  const stories = await Promise.all(
    topIds.map(
      (id) => fetch(`${HN_BASE}/item/${id}.json`).then((r) => r.ok ? r.json() : null).catch(() => null)
    )
  );
  const validStories = stories.filter((s) => s !== null && !!s.url && !!s.title);
  const lowerKeywords = keywords.map((k) => k.toLowerCase());
  const filtered = validStories.filter((s) => {
    const title = s.title.toLowerCase();
    return lowerKeywords.some((kw) => title.includes(kw));
  });
  return filtered.slice(0, limit).map((s) => {
    var _a;
    return {
      id: generateId(),
      title: s.title,
      url: s.url,
      source: "hackernews",
      author: s.by,
      score: s.score,
      commentCount: (_a = s.descendants) != null ? _a : 0,
      commentUrl: `https://news.ycombinator.com/item?id=${s.id}`,
      publishedAt: new Date(s.time * 1e3).toISOString(),
      domain: s.url ? extractDomain(s.url) : void 0
    };
  });
}

const hackernews_get = defineEventHandler(async (event) => {
  var _a;
  const query = getQuery(event);
  const keywords = query.keywords ? String(query.keywords).split(",") : [];
  const limit = Number((_a = query.limit) != null ? _a : 10);
  try {
    return await fetchHackerNews(keywords, limit);
  } catch (error) {
    const message = error instanceof Error ? error.message : "HackerNews \u6293\u53D6\u932F\u8AA4";
    throw createError({ statusCode: 500, statusMessage: message });
  }
});

export { hackernews_get as default };
//# sourceMappingURL=hackernews.get.mjs.map
