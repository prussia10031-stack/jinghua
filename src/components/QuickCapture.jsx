import { useState } from 'react';
import { useData } from '../context/DataContext';
import StarRating from './StarRating';

/**
 * 漫游 — 右下角悬浮按钮，点击随机抽取一条摘抄展示
 */
export default function QuickCapture() {
  const { excerpts, getBookById } = useData();
  const [picked, setPicked] = useState(null);
  const [open, setOpen] = useState(false);

  const handlePick = () => {
    if (excerpts.length === 0) { setPicked(null); setOpen(true); return; }
    const idx = Math.floor(Math.random() * excerpts.length);
    const excerpt = excerpts[idx];
    const book = excerpt.book_id ? getBookById(excerpt.book_id) : null;
    setPicked({ excerpt, book });
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handlePick}
        className="quick-capture-btn fixed z-[1000] flex items-center justify-center"
        style={{
          bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%',
          border: 'none', background: 'var(--primary-dark)', color: '#fff',
          fontSize: 22, cursor: 'pointer', boxShadow: 'var(--shadow)',
        }}
        title="漫游"
      >
        ✦
      </button>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-[2000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div onClick={(e) => e.stopPropagation()} className="rounded-[20px] p-6 w-[420px] max-w-[90vw]" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}>
            <h3 className="text-lg font-medium mb-3">✦ 漫游</h3>

            {picked ? (
              <>
                <div className="p-4 rounded-[12px] mb-4" style={{ background: '#fff', border: '1px solid #e0cfbe' }}>
                  {picked.excerpt.content && (
                    <div className="text-base mb-3 leading-relaxed">「{picked.excerpt.content}」</div>
                  )}
                  {picked.excerpt.image && (
                    <img src={picked.excerpt.image} alt="" className="rounded-lg mb-3 max-h-48" />
                  )}
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    📖 {picked.book ? `${picked.book.title} / ${picked.book.author}` : '(无源)'}
                    {picked.excerpt.chapter ? ` / ${picked.excerpt.chapter}` : ''}
                  </div>
                  {picked.book && <div className="mt-1"><StarRating value={picked.book.rating || 0} readonly /></div>}
                  {picked.book?.book_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {picked.book.book_tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={handlePick}>再抽一条</button>
                  <button className="btn btn-outline" onClick={() => setOpen(false)}>关闭</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>还没有摘抄，先去添加几条吧。</p>
                <button className="btn btn-outline" onClick={() => setOpen(false)}>关闭</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
