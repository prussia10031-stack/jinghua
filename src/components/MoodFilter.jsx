import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

export default function MoodFilter() {
  const { books, excerpts, getBookById, deleteExcerpt } = useData();
  const [activeTag, setActiveTag] = useState(null);

  // 从所有书籍中动态收集已用标签
  const allBookTags = useMemo(() => {
    const set = new Set();
    books.forEach((b) => (b.book_tags || []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [books]);

  const filteredExcerpts = useMemo(() => {
    if (!activeTag) return excerpts;
    const matchingBookIds = new Set(
      books.filter((b) => (b.book_tags || []).includes(activeTag)).map((b) => b.id),
    );
    return excerpts.filter((e) => matchingBookIds.has(e.book_id));
  }, [activeTag, books, excerpts]);

  return (
    <div
      className="p-6 rounded-[20px] mb-6"
      style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}
    >
      <h3 className="text-lg font-medium mb-3">
        🩹 寻觅
      </h3>

      {/* 标签筛选按钮 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveTag(null)}
          className="px-3 py-1 rounded-full text-xs transition"
          style={{
            background: activeTag === null ? 'var(--primary-dark)' : '#fff',
            color: activeTag === null ? '#fff' : 'var(--text-main)',
            border: activeTag === null ? 'none' : '1px solid #d3c8bc',
          }}
        >
          全部
        </button>
        {allBookTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className="px-3 py-1 rounded-full text-xs transition"
            style={{
              background: activeTag === tag ? 'var(--primary-dark)' : '#fff',
              color: activeTag === tag ? '#fff' : 'var(--text-main)',
              border: activeTag === tag ? 'none' : '1px solid #d3c8bc',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 结果计数 */}
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        {activeTag ? `标签「${activeTag}」` : '全部摘抄'} — {filteredExcerpts.length} 条
      </p>

      {/* 摘抄列表 */}
      {filteredExcerpts.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无匹配的摘抄。</p>
      ) : (
        <div className="grid gap-3">
          {filteredExcerpts.map((e) => {
            const book = e.book_id ? getBookById(e.book_id) : null;
            return (
              <div
                key={e.id}
                className="p-4 rounded-[12px]"
                style={{ background: '#fff', border: '1px solid #e8e0d8' }}
              >
                <div className="text-sm mb-2 leading-relaxed">「{e.content}」</div>
                <div className="flex items-center justify-between">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    📖 {book ? `${book.title} / ${book.author}` : '(无源)'}
                    {book && (
                      <span>
                        &nbsp;·&nbsp;
                        {'★'.repeat(Math.round((book.rating || 0) / 2))}
                        {book.rating ? ` ${(book.rating / 2).toFixed(1)}` : ''}
                      </span>
                    )}
                    &nbsp;·&nbsp;
                    🏷️ {e.excerpt_tags.length > 0 ? e.excerpt_tags.join(' / ') : '(无标签)'}
                  </div>
                  <button
                    className="btn btn-outline text-xs"
                    style={{ padding: '4px 12px', fontSize: 11 }}
                    onClick={() => deleteExcerpt(e.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
