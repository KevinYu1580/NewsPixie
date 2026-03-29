/**
 * 自動偵測任意網頁的 RSS/Atom feed URL
 * 策略：
 * 1. 先試常見路徑（/feed、/rss、/atom.xml 等）
 * 2. 抓 HTML 解析 <link rel="alternate" type="application/...+xml">
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const siteUrl = query.url ? String(query.url) : null;

  if (!siteUrl) {
    throw createError({ statusCode: 400, statusMessage: '缺少 url 參數' });
  }

  let origin: string;
  try {
    origin = new URL(siteUrl).origin;
  } catch {
    throw createError({ statusCode: 400, statusMessage: '無效的 URL 格式' });
  }

  const headers = { 'User-Agent': 'NewsPixie/1.0' };
  const FEED_PATHS = ['/feed', '/rss', '/feed.xml', '/atom.xml', '/rss.xml', '/index.xml', '/feed/atom', '/feeds/posts/default'];
  const FEED_TYPES = ['application/rss+xml', 'application/atom+xml', 'application/feed+json'];

  // 策略一：試常見路徑（preflight HEAD request）
  const probeResults = await Promise.allSettled(
    FEED_PATHS.map(async (path) => {
      const url = origin + path;
      const res = await fetch(url, { method: 'HEAD', headers });
      if (!res.ok) throw new Error('not found');
      const ct = res.headers.get('content-type') ?? '';
      if (FEED_TYPES.some((t) => ct.includes(t)) || ct.includes('xml')) return url;
      throw new Error('not a feed');
    }),
  );

  const fromProbe = probeResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map((r) => r.value);

  if (fromProbe.length > 0) {
    return { feeds: fromProbe };
  }

  // 策略二：抓 HTML 解析 <link rel="alternate"> 標籤
  try {
    const res = await fetch(siteUrl, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const linkRe = /<link[^>]+rel=["']alternate["'][^>]*>/gi;
    const hrefRe = /href=["']([^"']+)["']/i;
    const typeRe = /type=["']([^"']+)["']/i;

    const feeds: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = linkRe.exec(html)) !== null) {
      const tag = match[0];
      const typeMatch = typeRe.exec(tag);
      if (!typeMatch) continue;
      if (!FEED_TYPES.some((t) => typeMatch[1].includes(t.split('/')[1]))) continue;
      const hrefMatch = hrefRe.exec(tag);
      if (!hrefMatch) continue;
      const href = hrefMatch[1];
      feeds.push(href.startsWith('http') ? href : origin + (href.startsWith('/') ? href : '/' + href));
    }

    if (feeds.length > 0) return { feeds };
  } catch {
    // HTML 抓取失敗就繼續往下回傳空結果
  }

  return { feeds: [] };
});
