import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import BookForm from './components/BookForm';
import BookList from './components/BookList';
import ExcerptForm from './components/ExcerptForm';
import ExcerptList from './components/ExcerptList';
import QuickCapture from './components/QuickCapture';
import MoodFilter from './components/MoodFilter';
import SnackForm from './components/SnackForm';
import SnackList from './components/SnackList';
import Dashboard from './components/Dashboard';

const NAV_ITEMS = [
  { key: 'books',    label: '书目',   sub: '春山眉黛', icon: '📖' },
  { key: 'excerpts', label: '摘抄',   sub: '小池新涨', icon: '✏️' },
  { key: 'snacks',   label: '代餐',   sub: '花落衫中', icon: '💬' },
  { key: 'mood',     label: '寻觅',   sub: '细斟北斗', icon: '🩹' },
  { key: 'dashboard',label: '大观',   sub: '尽挹西江', icon: '📊' },
];

function Sidebar({ activeNav, onNavChange }) {
  const { books, excerpts, snacks } = useData();
  return (
    <aside className="sidebar">
      <div className="brand-card">
        <div className="brand-top"><span>📚</span> 镜花</div>
        <div className="brand-title">来如春梦无多时</div>
        <div className="brand-sub">去似朝云无觅处</div>
      </div>
      <nav className="nav-menu">
        {NAV_ITEMS.map((item) => (
          <button key={item.key} className={`nav-item ${activeNav === item.key ? 'active' : ''}`}
            onClick={() => onNavChange(item.key)}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <span className="nav-sub">{item.sub}</span>
          </button>
        ))}
      </nav>
      <div className="status-card">
        <div className="status-title">今日状态</div>
        <div>书架 <strong>{books.length}</strong> 本 · 摘抄 <strong>{excerpts.length}</strong> 条 · 代餐 <strong>{snacks.length}</strong> 则</div>
      </div>
    </aside>
  );
}

function BottomNav({ activeNav, onNavChange }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button key={item.key} className={`bottom-nav-item ${activeNav === item.key ? 'active' : ''}`}
          onClick={() => onNavChange(item.key)}>
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function MainContent({ activeNav }) {
  switch (activeNav) {
    case 'books':     return (<div className="page-content"><BookForm /><BookList /></div>);
    case 'excerpts':  return (<div className="page-content"><ExcerptForm /><ExcerptList /></div>);
    case 'snacks':    return (<div className="page-content"><SnackForm /><SnackList /></div>);
    case 'mood':      return <div className="page-content"><MoodFilter /></div>;
    case 'dashboard': return <div className="page-content"><Dashboard /></div>;
    default:          return null;
  }
}

function AppInner() {
  const [activeNav, setActiveNav] = useState('books');

  return (
    <div className="app-shell">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <main className="main-area">
        <div className="main-header">
          <span className="main-header-icon">{NAV_ITEMS.find(n => n.key === activeNav)?.icon}</span>
          <span>{NAV_ITEMS.find(n => n.key === activeNav)?.label} · {NAV_ITEMS.find(n => n.key === activeNav)?.sub}</span>
        </div>
        <MainContent activeNav={activeNav} />
      </main>
      <BottomNav activeNav={activeNav} onNavChange={setActiveNav} />
      <QuickCapture />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}
