import { d as defineEventHandler, g as getQuery, c as createError } from '../../nitro/nitro.mjs';
import { g as generateId } from '../../_/utils.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const LANGUAGE_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB"
};

const GH_API = "https://api.github.com";
async function fetchGithubTrending(query, limit = 8) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
  const q = encodeURIComponent(`${query} created:>${sevenDaysAgo}`);
  const url = `${GH_API}/search/repositories?q=${q}&sort=stars&order=desc&per_page=${limit}`;
  const headers = {
    Accept: "application/vnd.github+json"
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub \u641C\u5C0B\u5931\u6557: ${res.status}`);
  const data = await res.json();
  return data.items.map((r) => {
    var _a, _b;
    return {
      id: generateId(),
      name: r.full_name,
      url: r.html_url,
      description: (_a = r.description) != null ? _a : "",
      language: (_b = r.language) != null ? _b : void 0,
      languageColor: r.language ? LANGUAGE_COLORS[r.language] : void 0,
      stars: r.stargazers_count,
      forks: r.forks_count,
      source: "github"
    };
  });
}

const githubTrending_get = defineEventHandler(async (event) => {
  var _a, _b;
  const query = getQuery(event);
  const q = String((_a = query.query) != null ? _a : "developer-tools");
  const limit = Number((_b = query.limit) != null ? _b : 8);
  try {
    return await fetchGithubTrending(q, limit);
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub \u6293\u53D6\u932F\u8AA4";
    throw createError({ statusCode: 500, statusMessage: message });
  }
});

export { githubTrending_get as default };
//# sourceMappingURL=github-trending.get.mjs.map
