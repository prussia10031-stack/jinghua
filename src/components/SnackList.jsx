import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import SnackForm from './SnackForm';

export default function SnackList() {
  const { snacks, deleteSnack } = useData();
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [filterTag, setFilterTag] = useState(null);

  const filtered = useMemo(() => {
    if (!filterTag) return snacks;
    return snacks.filter((s) => (s.tags || []).includes(filterTag));
  }, [snacks, filterTag]);

  const categoryLabel = (c) => c === 'self' ? '自己' : '他人';
  const toggleSelect = (id) => { setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };
  const toggleAll = () => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map((s) => s.id))); };
  const deleteSelected = () => {
    if (selected.size === 0) return;
    if (!confirm(`确定删除选中的 ${selected.size} 条代餐？`)) return;
    selected.forEach((id) => deleteSnack(id));
    setSelected(new Set());
  };

  if (snacks.length === 0) return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无代餐记录。</p>;

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between py-2 mb-3 rounded-[12px] px-3" style={{ background: 'var(--bg)' }}>
        <h3 className="text-lg font-medium">代餐列表 ({filtered.length})</h3>
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

      {editingId && <SnackForm editTarget={snacks.find((s) => s.id === editingId)} onCancel={() => setEditingId(null)} />}

      <div className="grid gap-3">
        {filtered.map((s) => (
          <div key={s.id} className="flex gap-3 p-4 rounded-[20px]" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}>
            <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs" style={{
                  background: s.category === 'self' ? 'var(--primary-light)' : '#fde8e8',
                  color: s.category === 'self' ? 'var(--primary-dark)' : '#c0392b',
                }}>{categoryLabel(s.category)}{s.source ? ` · ${s.source}` : ''}{s.author ? ` · ${s.author}` : ''}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
              {s.content && <div className="text-sm mb-2 leading-relaxed">「{s.content}」</div>}
              {s.image && <img src={s.image} alt="" className="rounded-lg mb-2 max-h-32" />}
              {s.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {s.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs cursor-pointer"
                      style={{ background: filterTag === tag ? 'var(--primary-dark)' : '#fff', color: filterTag === tag ? '#fff' : 'var(--text-muted)', border: '1px solid #e0cfbe' }}
                      onClick={() => setFilterTag(filterTag === tag ? null : tag)}>{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button className="btn btn-outline text-xs" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => setEditingId(editingId === s.id ? null : s.id)}>编辑</button>
                <button className="btn btn-outline text-xs" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => deleteSnack(s.id)}>删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
