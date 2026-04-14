import { t, LANGUAGES } from '../i18n';

export default function IdleScreen({ onSelectLang }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #FD3434 0%, #ff6b6b 50%, #FD3434 100%)',
      color: '#fff', padding: 28, textAlign: 'center',
    }}>
      <img src="/logo.png" alt="Marketa" style={{
        width: 120, height: 120, marginBottom: 18, borderRadius: 22, objectFit: 'contain',
        background: 'rgba(255,255,255,0.15)', padding: 12,
      }} />
      <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 8, letterSpacing: 1 }}>Marketa</div>
      <div style={{ fontSize: 22, opacity: 0.9, marginBottom: 36 }}>
        Сусындар · Снэктер · Тағамдар
      </div>

      <div style={{ display: 'flex', gap: 18 }}>
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => onSelectLang(l.code)}
            style={{
              background: 'rgba(255,255,255,0.96)', color: '#1e293b',
              border: 'none', borderRadius: 18, padding: '20px 28px',
              fontSize: 24, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              minWidth: 150,
            }}
          >
            <span style={{ fontSize: 42 }}>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
