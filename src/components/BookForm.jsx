import { useState, useEffect } from 'react';
import { useData, SOURCES, TYPES, ORIENTATIONS } from '../context/DataContext';
import StarRating from './StarRating';

export default function BookForm({ editTarget, onCancel }) {
  const { addBook, updateBook, allTags, removeTag } = useData();
  const isEdit = !!editTarget;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState(SOURCES[0]);
  const [type, setType] = useState(TYPES[0]);
  const [orientation, setOrientation] = useState('');
  const [fandomWork, setFandomWork] = useState('');
  const [cpName, setCpName] = useState('');
  const [contentIntro, setContentIntro] = useState('');
  const [rating, setRating] = useState(0);
  const [bookTagsInput, setBookTagsInput] = useState('');

  useEffect(() => {
    if (editTarget) {
      setTitle(editTarget.title || '');
      setAuthor(editTarget.author || '');
      setSource(editTarget.source || SOURCES[0]);
      setType(editTarget.type || TYPES[0]);
      setOrientation(editTarget.orientation || '');
      setFandomWork(editTarget.fandom_work || '');
      setCpName(editTarget.cp_name || '');
      setContentIntro(editTarget.content_intro || '');
      setRating(editTarget.rating || 0);
      setBookTagsInput((editTarget.book_tags || []).join('，'));
    }
  }, [editTarget]);

  const resetForm = () => {
    setTitle(''); setAuthor(''); setSource(SOURCES[0]); setType(TYPES[0]);
    setOrientation(''); setFandomWork(''); setCpName('');
    setContentIntro(''); setRating(0); setBookTagsInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      author: author.trim(),
      source,
      type,
      orientation,
      fandom_work: fandomWork.trim(),
      cp_name: cpName.trim(),
      content_intro: contentIntro.trim(),
      rating,
      book_tags: bookTagsInput.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
    };
    if (isEdit) { updateBook(editTarget.id, data); onCancel?.(); }
    else { addBook(data); resetForm(); }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-[20px] mb-6"
      style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}
    >
      <h3 className="text-lg font-medium mb-4">
        {isEdit ? '编辑书籍' : '添加书籍'}
      </h3>

      {/* 书名 + 作者 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">书名 *</label>
          <input className="w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="书名" />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">作者</label>
          <input className="w-full" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="作者" />
        </div>
      </div>

      {/* 来源 + 类型 + 性向 */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">来源</label>
          <select className="w-full" value={source} onChange={(e) => setSource(e.target.value)}>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">类型</label>
          <select className="w-full" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">性向</label>
          <select className="w-full" value={orientation} onChange={(e) => setOrientation(e.target.value)}>
            <option value="">-- 不限 --</option>
            {ORIENTATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* 同人条件字段 */}
      {type === '同人' && (
        <div className="grid grid-cols-2 gap-3 mb-3 p-3 rounded-[12px]" style={{ background: 'var(--primary-light)' }}>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">来源作品</label>
            <input className="w-full" value={fandomWork} onChange={(e) => setFandomWork(e.target.value)} placeholder="原作名称" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">CP名称</label>
            <input className="w-full" value={cpName} onChange={(e) => setCpName(e.target.value)} placeholder="A x B" />
          </div>
        </div>
      )}

      {/* 内容介绍 */}
      <div className="mb-3">
        <label className="block text-xs text-[var(--text-muted)] mb-1">内容介绍</label>
        <textarea className="w-full" rows={3} value={contentIntro} onChange={(e) => setContentIntro(e.target.value)} placeholder="故事简介或主要情节..." />
      </div>

      {/* 评分 */}
      <div className="mb-3">
        <label className="block text-xs text-[var(--text-muted)] mb-1">评分</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* 书籍标签 — 自由文本 + 建议 */}
      <div className="mb-4">
        <label className="block text-xs text-[var(--text-muted)] mb-1">标签（逗号分隔）</label>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {allTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer"
                style={{ background: '#fff', border: '1px solid #e0cfbe' }}
                onClick={() => { const cur = bookTagsInput.split(/[,，]/).map(t=>t.trim()).filter(Boolean); if(!cur.includes(tag)) setBookTagsInput([...cur, tag].join('，')); }}>
                {tag}
                <span className="cursor-pointer" style={{ color: 'var(--text-muted)' }} onClick={(e) => { e.stopPropagation(); removeTag(tag); }}>×</span>
              </span>
            ))}
          </div>
        )}
        <input className="w-full" value={bookTagsInput} onChange={(e) => setBookTagsInput(e.target.value)} placeholder="哲思, 情绪, 人物..." />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary">
          {isEdit ? '保存修改' : '添加'}
        </button>
        {isEdit && <button type="button" className="btn btn-outline" onClick={onCancel}>取消</button>}
      </div>
    </form>
  );
}
