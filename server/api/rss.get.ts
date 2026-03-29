import { fetchRss } from '@/lib/api/rss';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const feedUrl = query.feed ? String(query.feed) : null;
  const limit = Number(query.limit ?? 8);

  if (!feedUrl) {
    throw createError({ statusCode: 400, statusMessage: '缺少 feed 參數' });
  }

  try {
    return await fetchRss(feedUrl, limit);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'RSS 抓取錯誤';
    throw createError({ statusCode: 500, statusMessage: message });
  }
});
