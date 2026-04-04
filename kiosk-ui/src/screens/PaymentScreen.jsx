/* Payment — Marketa, 800x480 */
import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createOrder, createPayment, getPaymentStatus, getOrder, simulatePayment } from '../api';
import { PAYMENT_POLL_INTERVAL } from '../config';
import { t } from '../i18n';

const TIMEOUT_SEC = 300;

export default function PaymentScreen({ lang, cart, total, onSuccess, onError, onCancel }) {
  const [step, setStep] = useState('creating');
  const [qrData, setQrData] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SEC);
  const [simulating, setSimulating] = useState(false);
  const pollRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const firstItem = cart[0];
        const order = await createOrder(firstItem.product_id, firstItem.slot_number);
        if (cancelled) return;
        setOrderNumber(order.order_number);
        const payment = await createPayment(order.id);
        if (cancelled) return;
        setQrData(payment.qr_data);
        setStep('qr');
        pollRef.current = setInterval(async () => {
          try {
            const st = await getPaymentStatus(order.id);
            if (st.status === 'completed') {
              clearInterval(pollRef.current); clearInterval(timerRef.current);
              onSuccess(await getOrder(order.id));
            } else if (st.status === 'failed') {
              clearInterval(pollRef.current); clearInterval(timerRef.current);
              onError('Payment failed');
            }
          } catch {}
        }, PAYMENT_POLL_INTERVAL);
        timerRef.current = setInterval(() => {
          setTimeLeft(p => { if (p <= 1) { clearInterval(pollRef.current); clearInterval(timerRef.current); onError('Timeout'); return 0; } return p - 1; });
        }, 1000);
      } catch (e) { if (!cancelled) onError(e.message); }
    }
    init();
    return () => { cancelled = true; clearInterval(pollRef.current); clearInterval(timerRef.current); };
  }, [cart, onSuccess, onError]);

  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;

  return (
    <div style={{ height: 'calc(100vh - 44px)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onCancel} style={{
          background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
          padding: '4px 10px', fontSize: 13, cursor: 'pointer', color: '#64748b',
        }}>{t(lang, 'back')}</button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{t(lang, 'payment')}</span>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 16px',
      }} className="fade-in">
        {step === 'creating' && (
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14, color: '#f59e0b', fontWeight: 600 }}>{t(lang, 'creatingOrder')}</div>
          </div>
        )}
        {step === 'qr' && (
          <>
            <div style={{ background: '#fff', borderRadius: 12, padding: 10, boxShadow: 'var(--shadow)', flexShrink: 0 }}>
              <QRCodeSVG value={qrData} size={150} level="M" bgColor="#fff" fgColor="#1e293b" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 240 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{total} ₸</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{t(lang, 'scanQR')} <strong>Kaspi.kz</strong></div>
              <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>⏳ {min}:{sec.toString().padStart(2, '0')}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
                {cart.map(c => <div key={c.id}>{c.product_name} ×{c.qty}</div>)}
              </div>
              <button
                disabled={simulating}
                onClick={async () => {
                  setSimulating(true);
                  try { await simulatePayment(orderNumber); } catch (e) { onError(e.message); }
                }}
                style={{
                  background: simulating ? '#94a3b8' : '#16a34a',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 0', fontSize: 15, fontWeight: 700,
                  cursor: simulating ? 'default' : 'pointer', width: '100%',
                }}
              >{simulating ? t(lang, 'checking') : t(lang, 'paid')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
