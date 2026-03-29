import { d as defineEventHandler, g as getQuery, c as createError } from '../../nitro/nitro.mjs';
import { XMLParser } from 'fast-xml-parser';
import { e as extractDomain, g as generateId } from '../../_/utils.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text"
});
function getText(val) {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && "#text" in val) {
    return String(val["#text"]);
  }
  return "";
}
function isBnext(feedUrl) {
  return feedUrl.includes("bnext.com.tw");
}
async function fetchRss(feedUrl, limit = 8) {
  var _a, _b, _c, _d, _e;
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "NewsPixie/1.0" }
  });
  if (!res.ok) throw new Error(`RSS \u6293\u53D6\u5931\u6557 (${feedUrl}): ${res.status}`);
  const xml = await res.text();
  const parsed = parser.parse(xml);
  const items = (_e = (_d = (_b = (_a = parsed == null ? void 0 : parsed.rss) == null ? void 0 : _a.channel) == null ? void 0 : _b.item) != null ? _d : (_c = parsed == null ? void 0 : parsed.feed) == null ? void 0 : _c.entry) != null ? _e : [];
  const itemArray = Array.isArray(items) ? items : [items];
  const source = isBnext(feedUrl) ? "bnext" : "rss";
  return itemArray.slice(0, limit).map((item) => {
    var _a2;
    const title = getText(item.title);
    const link = getText(item.link) || getText(item.guid);
    const author = getText(item["dc:creator"]) || getText(item.author);
    const pubDate = (_a2 = item.pubDate) != null ? _a2 : "";
    return {
      id: generateId(),
      title,
      url: link,
      source,
      author: author || void 0,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      domain: link ? extractDomain(link) : void 0
    };
  }).filter((item) => item.title && item.url);
}

const rss_get = defineEventHandler(async (event) => {
  var _a;
  const query = getQuery(event);
  const feedUrl = query.feed ? String(query.feed) : null;
  const limit = Number((_a = query.limit) != null ? _a : 8);
  if (!feedUrl) {
    throw createError({ statusCode: 400, statusMessage: "\u7F3A\u5C11 feed \u53C3\u6578" });
  }
  try {
    return await fetchRss(feedUrl, limit);
  } catch (error) {
    const message = error instanceof Error ? error.message : "RSS \u6293\u53D6\u932F\u8AA4";
    throw createError({ statusCode: 500, statusMessage: message });
  }
});

export { rss_get as default };
//# sourceMappingURL=rss.get.mjs.map
