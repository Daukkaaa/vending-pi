import { t } from '../i18n';

export default function Header({ lang, cartCount, cartTotal, onHome, onGoCart }) {
  return (
    <div style={{
      padding: '14px 18px', background: '#fff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      minHeight: 76,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onHome} style={{
          background: 'none', border: '2px solid #e2e8f0', borderRadius: 14,
          padding: '10px 18px', fontSize: 22, cursor: 'pointer', fontWeight: 700,
        }}>{t(lang, 'home')}</button>
        <img src="/logo.png" alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'contain' }} />
        <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>Marketa</span>
      </div>

      {cartCount > 0 && (
        <button onClick={onGoCart} style={{
          background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 22,
          padding: '12px 20px', fontSize: 22, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          🛒 {cartCount} · {cartTotal} ₸
        </button>
      )}
    </div>
  );
}
