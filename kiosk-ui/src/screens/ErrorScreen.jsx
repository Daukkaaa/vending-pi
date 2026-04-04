/* Error — Marketa, 800x480 */
import { t } from '../i18n';

export default function ErrorScreen({ lang, message, onRetry }) {
  return (
    <div className="fade-in" style={{
      height: 'calc(100vh - 44px)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>😕</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{t(lang, 'error')}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 18, maxWidth: 280 }}>{message}</div>
      <button onClick={onRetry} style={{
        background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10,
        padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
      }}>{t(lang, 'retry')}</button>
    </div>
  );
}
