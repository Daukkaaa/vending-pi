/* Persistent header — logo + Marketa + home button + cart */
import { t } from '../i18n';

export default function Header({ lang, cartCount, cartTotal, onHome, onGoCart }) {
  return (
    <div style={{
      padding: '8px 12px', background: '#fff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
    }}>
      {/* Left: home + logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onHome} style={{
          background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
          padding: '4px 10px', fontSize: 16, cursor: 'pointer',
        }}>{t(lang, 'home')}</button>
        <img src="/logo.png" alt="" style={{ width: 28, height: 28, borderRadius: 5, objectFit: 'contain' }} />
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>Marketa</span>
      </div>

      {/* Right: cart */}
      {cartCount > 0 && (
        <button onClick={onGoCart} style={{
          background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 18,
          padding: '5px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          🛒 {cartCount} — {cartTotal} ₸
        </button>
      )}
    </div>
  );
}
