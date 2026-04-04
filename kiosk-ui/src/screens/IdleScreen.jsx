/* Idle + language selection — Marketa, 800x480 */
import { t, LANGUAGES } from '../i18n';

export default function IdleScreen({ onSelectLang }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #FD3434 0%, #ff6b6b 50%, #FD3434 100%)',
      color: '#fff', padding: 20, textAlign: 'center',
    }}>
      <img src="/logo.png" alt="Marketa" style={{
        width: 72, height: 72, marginBottom: 10, borderRadius: 14, objectFit: 'contain',
        background: 'rgba(255,255,255,0.15)', padding: 6,
      }} />
      <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 4, letterSpacing: 1 }}>Marketa</div>
      <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 24 }}>
        Сусындар · Снэктер · Тағамдар
      </div>

      {/* Language buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => onSelectLang(l.code)}
            style={{
              background: 'rgba(255,255,255,0.95)', color: '#1e293b',
              border: 'none', borderRadius: 12, padding: '14px 24px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              minWidth: 100,
            }}
          >
            <span style={{ fontSize: 28 }}>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
