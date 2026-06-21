import { useState, useEffect, useRef } from 'react';
import { useData, SNACK_CATEGORIES, SNACK_SOURCES } from '../context/DataContext';

export default function SnackForm({ editTarget, onCancel }) {
  const { addSnack, updateSnack, allTags, removeTag } = useData();
  const isEdit = !!editTarget;

  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('self');
  const [source, setSource] = useState('');
  const [author, setAuthor] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (editTarget) {
      setContent(editTarget.content || '');
      setImage(editTarget.image || '');
      setCategory(editTarget.category || 'self');
      setSource(editTarget.source || '');
      setAuthor(editTarget.author || '');
      setTagsInput((editTarget.tags || []).join('，'));
    }
  }, [editTarget]);

  const resetForm = () => { setContent(''); setImage(''); setCategory('self'); setSource(''); setAuthor(''); setTagsInput(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    const data = {
      content: content.trim(),
      image,
      category,
      source: category === 'others' ? source : '',
      author: author.trim(),
      tags: tagsInput.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
    };
    if (isEdit) { updateSnack(editTarget.id, data); onCancel?.(); }
    else { addSnack(data); resetForm(); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('图片不能超过 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-[20px] mb-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}>
      <h3 className="text-lg font-medium mb-4">{isEdit ? '编辑代餐' : '添加代餐/口嗨'}</h3>

      <div className="mb-3">
        <label className="block text-xs text-[var(--text-muted)] mb-1">内容</label>
        <textarea className="w-full" rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="一句话或一段话..." />
      </div>

      <div className="mb-3">
        <label className="block text-xs text-[var(--text-muted)] mb-1">图片（可选，&lt;2MB）</label>
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} />
          {image && <button type="button" className="btn btn-outline text-xs" onClick={() => { setImage(''); if (fileRef.current) fileRef.current.value = ''; }}>清除</button>}
        </div>
        {image && <img src={image} alt="preview" className="mt-2 rounded-lg max-h-32" />}
      </div>

      <div className="mb-3">
        <label className="block text-xs text-[var(--text-muted)] mb-2">分类</label>
        <div className="flex gap-4">
          {SNACK_CATEGORIES.map((c) => (
            <label key={c.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="category" value={c.value} checked={category === c.value} onChange={() => setCategory(c.value)} />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      {category === 'others' && (
        <div className="grid grid-cols-2 gap-3 mb-3 p-3 rounded-[12px]" style={{ background: 'var(--primary-light)' }}>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">来源平台</label>
            <select className="w-full" value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">-- 选择 --</option>
              {SNACK_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">原作者</label>
            <input className="w-full" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="原作者ID" />
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs text-[var(--text-muted)] mb-1">标签（逗号分隔）</label>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {allTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer"
                style={{ background: '#fff', border: '1px solid #e0cfbe' }}
                onClick={() => { const current = tagsInput.split(/[,，]/).map(t=>t.trim()).filter(Boolean); if(!current.includes(tag)) setTagsInput([...current, tag].join('，')); }}>
                {tag}
                <span className="cursor-pointer" style={{ color: 'var(--text-muted)' }} onClick={(e) => { e.stopPropagation(); removeTag(tag); }}>×</span>
              </span>
            ))}
          </div>
        )}
        <input className="w-full" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="金句, 代餐, ..." />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary">{isEdit ? '保存修改' : '添加'}</button>
        {isEdit && <button type="button" className="btn btn-outline" onClick={onCancel}>取消</button>}
      </div>
    </form>
  );
}
