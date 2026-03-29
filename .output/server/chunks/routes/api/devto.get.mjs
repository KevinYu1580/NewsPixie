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

const DEVTO_BASE = "https://dev.to/api";
async function fetchDevTo(tag, limit = 10) {
  const url = `${DEVTO_BASE}/articles?tag=${encodeURIComponent(tag)}&top=1&per_page=${limit * 2}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`DEV.to \u6293\u53D6\u5931\u6557: ${res.status}`);
  const articles = await res.json();
  return articles.slice(0, limit).map((a) => ({
    id: generateId(),
    title: a.title,
    url: a.canonical_url || a.url,
    source: "devto",
    author: a.user.name || a.user.username,
    score: a.positive_reactions_count,
    commentCount: a.comments_count,
    commentUrl: a.url,
    publishedAt: a.published_at,
    tags: a.tag_list,
    domain: extractDomain(a.canonical_url || a.url)
  }));
}

const devto_get = defineEventHandler(async (event) => {
  var _a, _b;
  const query = getQuery(event);
  const tag = String((_a = query.tag) != null ? _a : "programming");
  const limit = Number((_b = query.limit) != null ? _b : 10);
  try {
    return await fetchDevTo(tag, limit);
  } catch (error) {
    const message = error instanceof Error ? error.message : "DEV.to \u6293\u53D6\u932F\u8AA4";
    throw createError({ statusCode: 500, statusMessage: message });
  }
});

export { devto_get as default };
//# sourceMappingURL=devto.get.mjs.map
