/* Pickup — blocks UI — Marketa, 800x480 */
import { useEffect, useState } from 'react';
import { PICKUP_SCREEN_TIMEOUT } from '../config';
import { t } from '../i18n';

export default function PickupScreen({ lang, order, onDone }) {
  const [cd, setCd] = useState(Math.floor(PICKUP_SCREEN_TIMEOUT / 1000));
  useEffect(() => {
    const tm = setInterval(() => {
      setCd(p => { if (p <= 1) { clearInterval(tm); onDone(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(tm);
  }, [onDone]);

  return (
    <div className="fade-in" style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #059669 0%, #16a34a 100%)',
      color: '#fff', textAlign: 'center', padding: 24,
    }}>
      <img src="/logo.png" alt="" style={{ width: 44, height: 44, borderRadius: 8, marginBottom: 10, objectFit: 'contain' }} />
      <div style={{ fontSize: 52, marginBottom: 8 }} className="pulse">✅</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{t(lang, 'paymentSuccess')}</div>
      <div style={{ fontSize: 15, opacity: 0.9, marginBottom: 14 }}>{t(lang, 'pickupItem')}</div>
      {order?.order_number && (
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '6px 18px', fontSize: 13, fontWeight: 600 }}>
          {t(lang, 'order')}: {order.order_number}
        </div>
      )}
      <div style={{ marginTop: 20, fontSize: 12, opacity: 0.5 }}>
        {t(lang, 'unlockIn')} {cd} {t(lang, 'sec')}
      </div>
    </div>
  );
}
