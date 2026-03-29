function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export { extractDomain as e, generateId as g };
//# sourceMappingURL=utils.mjs.map
