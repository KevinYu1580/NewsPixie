import { d as defineEventHandler, r as readBody, c as createError, u as useRuntimeConfig } from '../../nitro/nitro.mjs';
import Anthropic from '@anthropic-ai/sdk';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const ALLOWED_MODELS = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-opus-4-6"
];
const aiBriefing_post = defineEventHandler(async (event) => {
  let body;
  try {
    body = await readBody(event);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "\u7121\u6548\u7684\u8ACB\u6C42\u683C\u5F0F" });
  }
  const { topicName, headlines, apiKey: clientKey, model: clientModel } = body;
  const config = useRuntimeConfig();
  const resolvedKey = (clientKey == null ? void 0 : clientKey.trim()) || config.anthropicApiKey;
  if (!resolvedKey) {
    throw createError({
      statusCode: 503,
      statusMessage: "\u672A\u8A2D\u5B9A ANTHROPIC_API_KEY\uFF0C\u8ACB\u81F3\u53F3\u4E0A\u89D2\u8A2D\u5B9A\u8F38\u5165 API Key"
    });
  }
  if (!headlines || headlines.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "\u7F3A\u5C11 headlines" });
  }
  const model = clientModel && ALLOWED_MODELS.includes(clientModel) ? clientModel : "claude-haiku-4-5-20251001";
  const client = new Anthropic({ apiKey: resolvedKey });
  const headlineText = headlines.slice(0, 15).map((h, i) => `${i + 1}. ${h}`).join("\n");
  const prompt = `\u4F60\u662F\u4E00\u4F4D\u7C21\u6F54\u3001\u7CBE\u6E96\u7684\u79D1\u6280\u8CA1\u7D93\u6668\u9593\u64AD\u5831\u54E1\u3002
\u4EE5\u4E0B\u662F\u4ECA\u65E5\u300C${topicName}\u300D\u4E3B\u984C\u7684\u71B1\u9580\u6A19\u984C\uFF1A

${headlineText}

\u8ACB\u7528**\u7E41\u9AD4\u4E2D\u6587**\uFF0C\u4EE5 3 \u53E5\u8A71\uFF08\u6BCF\u53E5\u4E0D\u8D85\u904E 50 \u5B57\uFF09\u6458\u8981\u4ECA\u65E5\u6700\u91CD\u8981\u7684\u8DA8\u52E2\u6216\u6D1E\u898B\u3002
\u98A8\u683C\uFF1A\u76F4\u63A5\u3001\u7280\u5229\u3001\u6709\u6D1E\u5BDF\u529B\u3002\u4E0D\u8981\u7528\u300C\u4ECA\u5929\u300D\u7B49\u6A21\u7CCA\u8A5E\uFF0C\u805A\u7126\u5728\u5BE6\u8CEA\u5167\u5BB9\u3002
\u683C\u5F0F\uFF1A\u76F4\u63A5\u8F38\u51FA 3 \u53E5\u8A71\uFF0C\u7528\u63DB\u884C\u5206\u9694\uFF0C\u4E0D\u9700\u8981\u7DE8\u865F\u6216\u7B26\u865F\u3002`;
  try {
    const message = await client.messages.create({
      model,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }]
    });
    const summary = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    return { summary, generatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "AI \u6458\u8981\u751F\u6210\u5931\u6557";
    throw createError({ statusCode: 500, statusMessage: msg });
  }
});

export { aiBriefing_post as default };
//# sourceMappingURL=ai-briefing.post.mjs.map
