/* Category selection — only Еда, Снэки, Напитки — Marketa, 800x480 */
import { t } from '../i18n';

const FIXED_CATEGORIES = [
  { key: 'drinks', emoji: '🥤', color: '#3b82f6' },
  { key: 'snacks',  emoji: '🍿', color: '#f59e0b' },
  { key: 'food',    emoji: '🍱', color: '#16a34a' },
];

export default function CategoriesScreen({ lang, categories, loading, onSelect }) {
  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 44px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  // Only show categories that have products
  const available = FIXED_CATEGORIES.filter(c => categories.includes(c.key));

  return (
    <div style={{ height: 'calc(100vh - 44px)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '12px 16px 4px', fontSize: 18, fontWeight: 700 }}>
        {t(lang, 'selectCategory')}
      </div>
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: `repeat(${available.length}, 1fr)`,
        gap: 14, padding: '10px 16px', alignContent: 'center',
      }}>
        {available.map(cat => (
          <div
            key={cat.key}
            onClick={() => onSelect(cat.key)}
            style={{
              background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 20, cursor: 'pointer', gap: 10,
              border: `2px solid ${cat.color}22`, transition: 'transform 0.15s',
            }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: 52 }}>{cat.emoji}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: cat.color }}>
              {t(lang, cat.key)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
