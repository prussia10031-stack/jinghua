import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/idGen';
import { loadTags, saveTags, addTags, removeTag } from '../utils/tagStore';

// ---- 常量 ----
export const SOURCES = ['出版', 'AO3', '晋江', '豆阅', '小红书', 'Lof', '其他'];
export const TYPES = ['原创', '同人'];
export const ORIENTATIONS = ['BG', 'BL', '梦向'];
// 代餐常量
export const SNACK_CATEGORIES = [
  { value: 'self', label: '自己' },
  { value: 'others', label: '他人' },
];
export const SNACK_SOURCES = ['微博', 'B站', '小红书'];

// ---- Context ----
const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [books, setBooks] = useLocalStorage('reading_books_v2', []);
  const [excerpts, setExcerpts] = useLocalStorage('reading_excerpts_v2', []);
  const [snacks, setSnacks] = useLocalStorage('reading_snacks', []);
  const [allTags, setAllTags] = useState(loadTags);

  // 标签变更时持久化
  useEffect(() => { saveTags(allTags); }, [allTags]);

  // =========== Books CRUD ===========

  const addBook = useCallback(
    (data) => {
      const book = {
        id: generateId('b'),
        title: data.title || '',
        author: data.author || '',
        source: data.source || SOURCES[0],
        type: data.type || TYPES[0],
        orientation: data.orientation || '',
        fandom_work: data.fandom_work || '',
        cp_name: data.cp_name || '',
        content_intro: data.content_intro || '',
        rating: Math.max(0, Math.min(10, Number(data.rating) || 0)),
        book_tags: data.book_tags || [],
        created_at: new Date().toISOString(),
      };
      setBooks((prev) => [...prev, book]);
      return book;
    },
    [setBooks],
  );

  const updateBook = useCallback(
    (id, patch) => {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          const merged = { ...b, ...patch };
          if (patch.rating !== undefined) {
            merged.rating = Math.max(0, Math.min(10, Number(patch.rating) || 0));
          }
          return merged;
        }),
      );
    },
    [setBooks],
  );

  const deleteBook = useCallback(
    (id) => {
      setBooks((prev) => prev.filter((b) => b.id !== id));
      setExcerpts((prev) => prev.filter((e) => e.book_id !== id));
    },
    [setBooks, setExcerpts],
  );

  // =========== Excerpts CRUD ===========

  const addExcerpt = useCallback(
    (data) => {
      const excerpt = {
        id: generateId('e'),
        book_id: data.book_id || null,
        chapter: data.chapter || '',
        content: data.content || '',
        image: data.image || '',
        excerpt_tags: data.excerpt_tags || [],
        created_at: new Date().toISOString(),
      };
      setExcerpts((prev) => [...prev, excerpt]);
      if (excerpt.excerpt_tags.length) setAllTags((prev) => addTags([...prev, ...excerpt.excerpt_tags]));
      return excerpt;
    },
    [setExcerpts],
  );

  const updateExcerpt = useCallback(
    (id, patch) => {
      setExcerpts((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
      if (patch.excerpt_tags) setAllTags((prev) => addTags([...prev, ...patch.excerpt_tags]));
    },
    [setExcerpts],
  );

  const deleteExcerpt = useCallback(
    (id) => {
      setExcerpts((prev) => prev.filter((e) => e.id !== id));
    },
    [setExcerpts],
  );

  // =========== Snacks CRUD ===========

  const addSnack = useCallback(
    (data) => {
      const snack = {
        id: generateId('s'),
        content: data.content || '',
        image: data.image || '',
        category: data.category || 'self',
        source: data.source || '',
        author: data.author || '',
        tags: data.tags || [],
        created_at: new Date().toISOString(),
      };
      setSnacks((prev) => [...prev, snack]);
      if (snack.tags.length) setAllTags((prev) => addTags([...prev, ...snack.tags]));
      return snack;
    },
    [setSnacks],
  );

  const updateSnack = useCallback(
    (id, patch) => {
      setSnacks((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
      if (patch.tags) setAllTags((prev) => addTags([...prev, ...patch.tags]));
    },
    [setSnacks],
  );

  const deleteSnack = useCallback(
    (id) => {
      setSnacks((prev) => prev.filter((s) => s.id !== id));
    },
    [setSnacks],
  );

  // =========== 派生查询 ===========

  const getExcerptsByBook = useCallback(
    (bookId) => excerpts.filter((e) => e.book_id === bookId),
    [excerpts],
  );

  const getBookById = useCallback(
    (bookId) => books.find((b) => b.id === bookId) || null,
    [books],
  );

  // =========== 对外 Value ===========

  const value = useMemo(
    () => ({
      books, excerpts, snacks, allTags,
      addBook, updateBook, deleteBook,
      addExcerpt, updateExcerpt, deleteExcerpt,
      addSnack, updateSnack, deleteSnack,
      getExcerptsByBook, getBookById,
      removeTag: (tag) => setAllTags((prev) => removeTag(tag)),
    }),
    [
      books, excerpts, snacks, allTags,
      addBook, updateBook, deleteBook,
      addExcerpt, updateExcerpt, deleteExcerpt,
      addSnack, updateSnack, deleteSnack,
      getExcerptsByBook, getBookById,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData() must be used within a <DataProvider>');
  }
  return ctx;
}
