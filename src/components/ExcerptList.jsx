import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import ExcerptForm from './ExcerptForm';

export default function ExcerptList() {
  const { excerpts, books, deleteExcerpt } = useData();
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [filterTag, setFilterTag] = useState(null);

  const filtered = useMemo(() => {
    if (!filterTag) return excerpts;
    return excerpts.filter((e) => (e.excerpt_tags || []).includes(filterTag));
  }, [excerpts, filterTag]);

  const getBookTitle = (bookId, chapter) => {
    if (!bookId) return chapter ? `(无源) / ${chapter}` : '(无源)';
    const book = books.find((b) => b.id === bookId);
    const base = book ? `${book.title} / ${book.author}` : '(已删除)';
    return chapter ? `${base} / ${chapter}` : base;
  };

  const toggleSelect = (id) => { setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };
  const toggleAll = () => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map((e) => e.id))); };
  const deleteSelected = () => {
    if (selected.size === 0) return;
    if (!confirm(`确定删除选中的 ${selected.size} 条摘抄？`)) return;
    selected.forEach((id) => deleteExcerpt(id));
    setSelected(new Set());
  };

  if (excerpts.length === 0) return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无摘抄记录。</p>;

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between py-2 mb-3 rounded-[12px] px-3" style={{ background: 'var(--bg)' }}>
        <h3 className="text-lg font-medium">摘抄列表 ({filtered.length})</h3>
        <div className="flex items-center gap-2">
          {filterTag && (
            <span className="text-xs px-2 py-0.5 rounded-full cursor-pointer" style={{ background: 'var(--primary-dark)', color: '#fff' }}
              onClick={() => setFilterTag(null)}>筛选: {filterTag} ✕</span>
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

      {editingId && <ExcerptForm editTarget={excerpts.find((e) => e.id === editingId)} onCancel={() => setEditingId(null)} />}

      <div className="grid gap-3">
        {filtered.map((e) => (
          <div key={e.id} className="flex gap-3 p-4 rounded-[20px]" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}>
            <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} className="mt-1" />
            <div className="flex-1">
              {e.content && <div className="text-sm mb-2 leading-relaxed">「{e.content}」</div>}
              {e.image && <img src={e.image} alt="" className="rounded-lg mb-2 max-h-32" />}
              <div className="flex items-center justify-between">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  📖 {getBookTitle(e.book_id, e.chapter)}
                  {e.excerpt_tags.length > 0 && (
                    <span className="flex flex-wrap gap-1.5 mt-1">
                      {e.excerpt_tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs cursor-pointer"
                          style={{ background: filterTag === tag ? 'var(--primary-dark)' : '#fff', color: filterTag === tag ? '#fff' : 'var(--text-muted)', border: '1px solid #e0cfbe' }}
                          onClick={() => setFilterTag(filterTag === tag ? null : tag)}>{tag}</span>
                      ))}
                    </span>
                  )}
                  <span> · {new Date(e.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline text-xs" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => setEditingId(editingId === e.id ? null : e.id)}>编辑</button>
                  <button className="btn btn-outline text-xs" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => deleteExcerpt(e.id)}>删除</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
