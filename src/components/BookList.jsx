import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import BookForm from './BookForm';
import StarRating from './StarRating';

export default function BookList() {
  const { books, deleteBook } = useData();
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [filterTag, setFilterTag] = useState(null);

  const filtered = useMemo(() => {
    if (!filterTag) return books;
    return books.filter((b) => (b.book_tags || []).includes(filterTag));
  }, [books, filterTag]);

  const toggleSelect = (id) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((b) => b.id)));
  };
  const deleteSelected = () => {
    if (selected.size === 0) return;
    if (!confirm(`确定删除选中的 ${selected.size} 本书及其摘抄？`)) return;
    selected.forEach((id) => deleteBook(id));
    setSelected(new Set());
  };

  if (books.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无书籍记录。</p>;
  }

  return (
    <div>
      {/* Sticky 批量操作栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between py-2 mb-3 rounded-[12px] px-3" style={{ background: 'var(--bg)' }}>
        <h3 className="text-lg font-medium">书籍列表 ({filtered.length})</h3>
        <div className="flex items-center gap-2">
          {filterTag && (
            <span className="text-xs px-2 py-0.5 rounded-full cursor-pointer" style={{ background: 'var(--primary-dark)', color: '#fff' }}
              onClick={() => setFilterTag(null)}>
              筛选: {filterTag} ✕
            </span>
          )}
          <label className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} /> 全选
          </label>
          {selected.size > 0 && (
            <button className="text-xs" style={{ padding: '4px 12px', fontSize: 11, color: '#c0392b', border: '1px solid #c0392b', borderRadius: 20, background: 'transparent', cursor: 'pointer' }}
              onClick={deleteSelected}>删除选中 ({selected.size})</button>
          )}
        </div>
      </div>

      {editingId && <BookForm editTarget={books.find((b) => b.id === editingId)} onCancel={() => setEditingId(null)} />}

      <div className="grid gap-4">
        {filtered.map((b) => (
          <div key={b.id} className="flex gap-3 p-5 rounded-[20px]" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}>
            <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggleSelect(b.id)} className="mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-base font-semibold">{b.title}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {b.author} · {b.source} · {b.type}{b.orientation ? ` · ${b.orientation}` : ''}
                    {b.fandom_work ? ` · 原作: ${b.fandom_work}` : ''}{b.cp_name ? ` · CP: ${b.cp_name}` : ''}
                  </p>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(b.created_at).toLocaleDateString()}</span>
              </div>
              <div className="mb-2"><StarRating value={b.rating || 0} readonly /></div>
              {b.content_intro && <p className="text-sm mb-2"><span className="text-xs" style={{ color: 'var(--text-muted)' }}>内容介绍：</span>{b.content_intro}</p>}
              {b.book_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                  {b.book_tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs cursor-pointer" style={{ background: filterTag === tag ? 'var(--primary-dark)' : 'var(--primary-light)', color: filterTag === tag ? '#fff' : 'var(--primary-dark)' }}
                      onClick={() => setFilterTag(filterTag === tag ? null : tag)}>{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button className="btn btn-outline text-xs" onClick={() => setEditingId(editingId === b.id ? null : b.id)}>编辑</button>
                <button className="btn btn-outline text-xs" onClick={() => { if (confirm('确定删除？')) deleteBook(b.id); }}>删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
