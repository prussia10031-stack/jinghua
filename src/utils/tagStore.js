/**
 * 已用标签持久化存储
 * key: 'reading_tags' → string[]
 */

const KEY = 'reading_tags';

export function loadTags() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTags(tags) {
  // 去重、排序
  const unique = [...new Set(tags)].sort();
  localStorage.setItem(KEY, JSON.stringify(unique));
}

export function addTags(newTags) {
  const existing = loadTags();
  const merged = [...new Set([...existing, ...newTags])];
  saveTags(merged);
  return merged;
}

export function removeTag(tag) {
  const existing = loadTags();
  const filtered = existing.filter((t) => t !== tag);
  saveTags(filtered);
  return filtered;
}
