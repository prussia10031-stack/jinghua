/**
 * 生成带前缀的短 ID
 * 格式: {prefix}_{timestamp36进制}_{4位随机36进制}
 * 例: b_lm8k3x_a3fz
 */
export function generateId(prefix = 'x') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${timestamp}_${random}`;
}
