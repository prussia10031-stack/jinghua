import { useState, useCallback } from 'react';

/**
 * 通用 LocalStorage 封装 Hook
 * - 初始化时从 localStorage 读取，无数据则用 initialValue
 * - setValue 同步写入 localStorage
 * - key 变化时重新读取（处理 key 动态场景）
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          console.error(`Failed to write localStorage key "${key}":`, e);
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
