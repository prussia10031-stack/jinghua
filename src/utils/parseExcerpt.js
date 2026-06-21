/**
 * 解析含 ◆ 标记的摘抄文本，自动识别章节名与摘抄。
 *
 * 规则：
 * 1. 逐行处理，空行跳过
 * 2. 行内按 ◆ 分段；也可跨行组合（如 "11\n◆ AAA\n◆ BBB"）
 * 3. 每行第一个 ◆ 之前的非空文本视为章节名（如 "11◆ AAA" → "11" 是章节）
 * 4. 行首就是 ◆（或行内无章节名前缀）→ 沿用上一个章节名
 * 5. 每个 ◆ 段去除首尾空格后作为一条摘抄
 *
 * 覆盖场景：
 *   "11\n◆ AAA\n◆ BBB"     → 章节 "11", 摘抄 AAA, BBB
 *   "11◆ AAA ◆ BBB"        → 同上（单行紧凑写法）
 *   "◆ AAA ◆ BBB"          → 章节 "未命名章节", 摘抄 AAA, BBB
 *   "AAA ◆ BBB"            → 章节 "AAA", 摘抄 BBB
 *   "AAA\n◆ BBB"           → 章节 "AAA", 摘抄 BBB
 *
 * @param {string} text
 * @returns {Array<{ chapter: string, content: string }>}
 */
export function parseExcerptText(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const result = [];
  let currentChapter = '未命名章节';

  // 匹配 ◆ / ◇ / ♦ / ➤ / ▸ / ▪ / ■ 等标记
  const MARKER_RE = /[◆◇♦➤▸▪■]/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // 将行按 ◆ 标记拆成片段
    const segments = line.split(MARKER_RE).map((s) => s.trim());

    // 如果没有标记 → 整行是章节名
    if (segments.length === 1) {
      currentChapter = segments[0];
      continue;
    }

    // 有标记：第一个片段若不为空 → 章节名
    if (segments[0]) {
      currentChapter = segments[0];
    }

    // 后续每个非空片段 → 一条摘抄
    for (let i = 1; i < segments.length; i++) {
      const content = segments[i];
      if (content) {
        result.push({ chapter: currentChapter, content });
      }
    }
  }

  return result;
}
