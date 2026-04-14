import { t } from '../i18n';

const FIXED_CATEGORIES = [
  { key: 'drinks', emoji: '🥤', color: '#3b82f6' },
  { key: 'snacks', emoji: '🍿', color: '#f59e0b' },
  { key: 'food', emoji: '🍱', color: '#16a34a' },
];

export default function CategoriesScreen({ lang, categories, loading, onSelect }) {
  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 76px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const available = FIXED_CATEGORIES.filter(c => categories.includes(c.key));

  return (
    <div style={{ height: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '18px 24px 10px', fontSize: 32, fontWeight: 800 }}>
        {t(lang, 'selectCategory')}
      </div>
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: `repeat(${available.length || 1}, 1fr)`,
        gap: 18, padding: '16px 24px 24px', alignContent: 'center',
      }}>
        {available.map(cat => (
          <div
            key={cat.key}
            onClick={() => onSelect(cat.key)}
            style={{
              background: '#fff', borderRadius: 22, boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 28, cursor: 'pointer', gap: 16, minHeight: 220,
              border: `3px solid ${cat.color}22`, transition: 'transform 0.15s',
            }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: 82 }}>{cat.emoji}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: cat.color }}>
              {t(lang, cat.key)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
