import { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { parseExcerptText } from '../utils/parseExcerpt';

export default function ExcerptForm({ editTarget, onCancel }) {
  const { books, addBook, addExcerpt, updateExcerpt, allTags, removeTag } = useData();
  const isEdit = !!editTarget;

  const [bookId, setBookId] = useState('');
  const [chapter, setChapter] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // 自动创建书籍
  const [autoCreateOpen, setAutoCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (editTarget) {
      setBookId(editTarget.book_id || '');
      setChapter(editTarget.chapter || '');
      setContent(editTarget.content || '');
      setImage(editTarget.image || '');
      setTagsInput((editTarget.excerpt_tags || []).join('，'));
    }
  }, [editTarget]);

  const resetForm = () => { setChapter(''); setContent(''); setImage(''); setTagsInput(''); };

  // 保存（自动检测是否需要拆分）
  const doSave = (bkId) => {
    const txt = content.trim();

    // 尝试智能拆分：如果文本中包含 ◆ 标记，自动解析为多条
    if (txt.includes('◆')) {
      const parsed = parseExcerptText(txt);
      if (parsed.length > 0) {
        parsed.forEach((item) => {
          addExcerpt({
            book_id: bkId || null,
            chapter: item.chapter,
            content: item.content,
            excerpt_tags: tagsInput.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
          });
        });
        if (isEdit) onCancel?.();
        else resetForm();
        return;
      }
    }

    // 不含 ◆ 标记，单条保存
    const data = {
      book_id: bkId || null,
      chapter: chapter.trim(),
      content: txt,
      image,
      excerpt_tags: tagsInput.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
    };
    if (isEdit) { updateExcerpt(editTarget.id, data); onCancel?.(); }
    else { addExcerpt(data); resetForm(); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    if (!bookId) { setAutoCreateOpen(true); return; }
    doSave(bookId);
  };

  const handleAutoCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const book = addBook({ title: newTitle.trim(), author: newAuthor.trim() });
    doSave(book.id);
    setAutoCreateOpen(false);
    setNewTitle('');
    setNewAuthor('');
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
    <>
      <form onSubmit={handleSubmit} className="p-6 rounded-[20px] mb-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}>
        <div className="mb-4">
          <h3 className="text-lg font-medium">{isEdit ? '编辑摘抄' : '添加摘抄'}</h3>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-[var(--text-muted)] mb-1">所属书籍</label>
          <select className="w-full" value={bookId} onChange={(e) => setBookId(e.target.value)}>
            <option value="">-- 无源摘抄（提交时可自动创建）--</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-[var(--text-muted)] mb-1">章节</label>
          <input className="w-full" value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="可选，手动填写或智能拆分自动填充" />
        </div>

        <div className="mb-1">
          <label className="block text-xs text-[var(--text-muted)]">内容（含 ◆ 标记自动拆分为多条）</label>
        </div>
        <textarea
          className="w-full mb-3"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="摘抄原文... 或粘贴含 ◆ 标记的笔记全文自动拆分"
        />

        <div className="mb-3">
          <label className="block text-xs text-[var(--text-muted)] mb-1">图片（可选，&lt;2MB）</label>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} />
            {image && <button type="button" className="btn btn-outline text-xs" onClick={() => { setImage(''); if (fileRef.current) fileRef.current.value = ''; }}>清除图片</button>}
          </div>
          {image && <img src={image} alt="preview" className="mt-2 rounded-lg max-h-32" />}
        </div>

        <div className="mb-4">
          <label className="block text-xs text-[var(--text-muted)] mb-1">标签（逗号分隔）</label>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer"
                  style={{ background: '#fff', border: '1px solid #e0cfbe' }}
                  onClick={() => { const cur = tagsInput.split(/[,，]/).map(t=>t.trim()).filter(Boolean); if(!cur.includes(tag)) setTagsInput([...cur, tag].join('，')); }}>
                  {tag}
                  <span className="cursor-pointer" style={{ color: 'var(--text-muted)' }} onClick={(e) => { e.stopPropagation(); removeTag(tag); }}>×</span>
                </span>
              ))}
            </div>
          )}
          <input className="w-full" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="名场面, 虐心, 金句" />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary">{isEdit ? '保存修改' : '添加'}</button>
          {isEdit && <button type="button" className="btn btn-outline" onClick={onCancel}>取消</button>}
        </div>
      </form>

      {/* 自动创建书籍弹窗 */}
      {autoCreateOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setAutoCreateOpen(false)}>
          <form onSubmit={handleAutoCreate} className="rounded-[20px] p-6 w-[380px] max-w-[90vw]" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-3">快速创建书籍</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>未选择书籍，请先创建一本：</p>
            <div className="mb-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1">书名 *</label>
              <input className="w-full" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="书名" autoFocus />
            </div>
            <div className="mb-4">
              <label className="block text-xs text-[var(--text-muted)] mb-1">作者</label>
              <input className="w-full" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} placeholder="作者" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">创建并添加</button>
              <button type="button" className="btn btn-outline" onClick={() => setAutoCreateOpen(false)}>取消</button>
            </div>
          </form>
        </div>
      )}

    </>
  );
}
