import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const VIEWS = [
  { key: 'year', label: '年' },
  { key: 'month', label: '月' },
  { key: 'week', label: '周' },
];

const neuCard = {
  background: 'var(--card-bg)',
  boxShadow: '6px 6px 15px #e6dfd5, -6px -6px 15px #ffffff',
  borderRadius: 16,
};

const neuInset = {
  background: 'var(--card-bg)',
  boxShadow: 'inset 4px 4px 10px #e6dfd5, inset -4px -4px 10px #ffffff',
  borderRadius: 16,
};

const heatColors = ['#f5efe8', '#ead9c8', '#ddc4a8', '#cfae88', '#c19868', '#b38248', '#7b5842'];

function getHeatColor(count, max) {
  if (!max || count === 0) return '#f5efe8';
  const idx = Math.min(heatColors.length - 1, Math.floor((count / max) * (heatColors.length - 1)));
  return heatColors[idx];
}

function StatCard({ label, value, sub }) {
  return (
    <div className="p-4 rounded-[16px] text-center" style={neuCard}>
      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-xl font-semibold" style={{ color: '#7b5842' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { excerpts } = useData();
  const now = new Date();
  const [view, setView] = useState('year');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11

  // 可用年份
  const years = useMemo(() => {
    const set = new Set();
    excerpts.forEach((e) => set.add(new Date(e.created_at).getFullYear()));
    return [...set].sort((a, b) => b - a);
  }, [excerpts]);

  // 按日期聚合
  const dateMap = useMemo(() => {
    const map = {};
    excerpts.forEach((e) => {
      const d = e.created_at.slice(0, 10);
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [excerpts]);

  // 年度数据
  const yearData = useMemo(() => {
    const counts = new Array(12).fill(0);
    Object.entries(dateMap).forEach(([d, c]) => {
      if (d.startsWith(String(year))) counts[new Date(d).getMonth()]++;
    });
    const total = counts.reduce((a, b) => a + b, 0);
    const max = Math.max(...counts, 1);
    return { counts, total, max };
  }, [dateMap, year]);

  // 月度数据 (calendar grid)
  const monthData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    const days = [];
    // 前置空白
    for (let i = 0; i < startDow; i++) days.push(null);
    // 实际日期
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, count: dateMap[key] || 0, date: key });
    }

    const max = Math.max(...days.filter(Boolean).map((x) => x.count), 1);
    const total = days.filter(Boolean).reduce((s, x) => s + x.count, 0);

    // 按周分组
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return { weeks, max, total };
  }, [dateMap, year, month]);

  // 周度数据 (最近12周)
  const weekData = useMemo(() => {
    const weeks = [];
    const today = new Date();
    // 回到本周日
    const cursor = new Date(today);
    cursor.setDate(cursor.getDate() - cursor.getDay());
    // 往前推11周 = 共12周
    cursor.setDate(cursor.getDate() - 11 * 7);

    let globalMax = 1;
    for (let w = 0; w < 12; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = cursor.toISOString().slice(0, 10);
        const count = dateMap[key] || 0;
        if (count > globalMax) globalMax = count;
        week.push({ day: cursor.getDate(), month: cursor.getMonth() + 1, count, date: key, isToday: key === today.toISOString().slice(0, 10) });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    const total = weeks.flat().reduce((s, x) => s + x.count, 0);
    return { weeks, max: globalMax, total };
  }, [dateMap]);

  const viewsData = { year: yearData, month: monthData, week: weekData };
  const current = viewsData[view];

  return (
    <div>
      {/* 顶部统计 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="总摘抄" value={current.total} sub={view === 'year' ? `${year} 年` : view === 'month' ? `${year}年${month + 1}月` : '近12周'} />
        <StatCard label="峰值" value={current.max > 0 ? current.max : '—'} sub="单日/月最高" />
        <StatCard label="均值" value={current.total > 0 ? (current.total / (view === 'year' ? 12 : view === 'month' ? monthData.weeks.length : 12)).toFixed(1) : '0'} sub={view === 'year' ? '条/月' : '条/周'} />
      </div>

      {/* 标题 + 视图切换 + 年份选择 */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-lg font-medium">大观 · 尽挹西江</h3>

        {/* 视图切换 tabs */}
        <div className="flex rounded-full p-1" style={{ background: '#ece5da' }}>
          {VIEWS.map((v) => (
            <button key={v.key} className="px-4 py-1.5 rounded-full text-sm transition"
              style={{ background: view === v.key ? 'var(--primary-dark)' : 'transparent', color: view === v.key ? '#fff' : 'var(--text-muted)' }}
              onClick={() => setView(v.key)}>{v.label}</button>
          ))}
        </div>

        {/* 月选择器（月视图） */}
        {view === 'month' && (
          <div className="flex items-center gap-1">
            <button className="text-xs px-2 py-1" onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }}>◀</button>
            <span className="text-sm font-medium">{year}年{month + 1}月</span>
            <button className="text-xs px-2 py-1" onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }}>▶</button>
          </div>
        )}

        {/* 年份选择 */}
        <div className="flex gap-1 ml-auto">
          {years.slice(0, 5).map((y) => (
            <button key={y} className="px-2.5 py-1 rounded-full text-xs"
              style={{ background: y === year ? 'var(--primary-dark)' : 'transparent', color: y === year ? '#fff' : 'var(--text-muted)', border: y === year ? 'none' : '1px solid #d3c8bc' }}
              onClick={() => setYear(y)}>{y}</button>
          ))}
        </div>
      </div>

      {/* 热力图区域 */}
      {current.total > 0 ? (
        <div className="p-5 rounded-[16px]" style={neuInset}>
          {view === 'year' && <YearHeatmap counts={yearData.counts} max={yearData.max} />}
          {view === 'month' && <MonthHeatmap weeks={monthData.weeks} max={monthData.max} />}
          {view === 'week' && <WeekHeatmap weeks={weekData.weeks} max={weekData.max} />}
        </div>
      ) : (
        <div className="p-10 rounded-[16px] text-center" style={neuCard}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>这个周期还没有摘抄。开始记录吧。</p>
        </div>
      )}

      {/* 图例 */}
      <div className="flex items-center gap-1.5 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>少</span>
        {heatColors.map((c) => (
          <div key={c} className="rounded-sm" style={{ width: 13, height: 13, background: c }} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}

/** 年视图 — 12 柱 */
function YearHeatmap({ counts, max }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-end" style={{ height: 140 }}>
      {counts.map((c, i) => (
        <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
          <div className="w-full rounded-lg transition-all hover:scale-105"
            style={{
              height: Math.max(6, (c / max) * 120),
              background: getHeatColor(c, max),
              boxShadow: c > 0 ? '1px 3px 6px rgba(123,88,66,0.15)' : 'inset 1px 1px 2px #e6dfd5',
              borderRadius: 8,
            }}
            title={`${MONTHS[i]}: ${c} 条`}
          />
          <span className="text-xs" style={{ color: c === max && max > 0 ? '#7b5842' : 'var(--text-muted)' }}>{MONTHS[i]}</span>
        </div>
      ))}
    </div>
  );
}

/** 月视图 — 日历热力图 */
function MonthHeatmap({ weeks, max }) {
  return (
    <div>
      {/* 星期头 */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{d}</div>
        ))}
      </div>
      {/* 日历格 */}
      <div className="grid grid-cols-7 gap-1.5">
        {weeks.flat().map((cell, i) => (
          <div key={i} className="aspect-square rounded-md flex flex-col items-center justify-center text-xs"
            style={{
              background: cell ? getHeatColor(cell.count, max) : 'transparent',
              color: cell && cell.count > max * 0.6 ? '#fff' : 'var(--text-main)',
              boxShadow: cell && cell.count > 0 ? '1px 2px 4px rgba(123,88,66,0.1)' : 'none',
              opacity: cell ? 1 : 0,
            }}
            title={cell ? `${cell.date}: ${cell.count} 条` : ''}
          >
            {cell?.day}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 周视图 — 12 周 × 7 天格子 */
function WeekHeatmap({ weeks, max }) {
  return (
    <div>
      <div className="flex gap-1 mb-1.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="flex-1 text-xs text-center" style={{ color: 'var(--text-muted)' }}>{d}</div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5 flex-1">
            {week.map((day, di) => (
              <div key={di} className="aspect-square rounded-sm"
                style={{
                  background: getHeatColor(day.count, max),
                  boxShadow: day.isToday ? '0 0 0 2px #7b5842' : day.count > 0 ? '1px 1px 3px rgba(123,88,66,0.1)' : 'none',
                }}
                title={`${day.date}: ${day.count} 条`}
              />
            ))}
            <span className="text-xs text-center mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {weeks[wi][0]?.month}/{weeks[wi][0]?.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
