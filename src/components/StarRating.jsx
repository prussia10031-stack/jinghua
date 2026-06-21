import { useState } from 'react';

/**
 * 五角星评分组件 — 支持半星
 * value: 0-10 (0 = 0星, 5 = 2.5星, 10 = 5星)
 * onChange: 回调传 0-10 的整数值
 */
const STARS = [1, 2, 3, 4, 5];

export default function StarRating({ value = 0, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  const display = hover || value; // 0-10

  const handleClick = (star, half) => {
    if (readonly || !onChange) return;
    const score = half ? star * 2 - 1 : star * 2; // 半星: star*2-1, 全星: star*2
    onChange(score);
  };

  const getStarClass = (star, half) => {
    const threshold = half ? star * 2 - 1 : star * 2;
    return display >= threshold
      ? 'text-amber-400'
      : 'text-gray-300';
  };

  return (
    <div className="inline-flex items-center gap-0.5" style={{ cursor: readonly ? 'default' : 'pointer' }}>
      {STARS.map((star) => (
        <span key={star} className="relative inline-block" style={{ width: 20, height: 20 }}>
          {/* 左半 — 半星 */}
          <span
            className={`absolute inset-0 w-1/2 overflow-hidden ${getStarClass(star, true)}`}
            onClick={() => handleClick(star, true)}
            onMouseEnter={() => !readonly && setHover(star * 2 - 1)}
            onMouseLeave={() => !readonly && setHover(0)}
            style={{ zIndex: 2, cursor: readonly ? 'default' : 'pointer' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
          {/* 右半 — 全星 */}
          <span
            className={`absolute inset-0 left-1/2 w-1/2 overflow-hidden ${getStarClass(star, false)}`}
            onClick={() => handleClick(star, false)}
            onMouseEnter={() => !readonly && setHover(star * 2)}
            onMouseLeave={() => !readonly && setHover(0)}
            style={{ zIndex: 2, cursor: readonly ? 'default' : 'pointer' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
        </span>
      ))}
      {!readonly && (
        <span className="text-xs text-[var(--text-muted)] ml-1">
          {(value / 2).toFixed(1)} 星
        </span>
      )}
    </div>
  );
}
