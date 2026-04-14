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
    <div style={{ height: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onCancel} style={{
          background: 'none', border: '2px solid #e2e8f0', borderRadius: 12,
          padding: '10px 16px', fontSize: 20, cursor: 'pointer', color: '#64748b', fontWeight: 700,
        }}>{t(lang, 'back')}</button>
        <span style={{ fontSize: 28, fontWeight: 800 }}>{t(lang, 'payment')}</span>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 18px',
      }} className="fade-in">
        {step === 'creating' && (
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 18px' }} />
            <div style={{ fontSize: 24, color: '#f59e0b', fontWeight: 700 }}>{t(lang, 'creatingOrder')}</div>
          </div>
        )}
        {step === 'qr' && (
          <>
            <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: 'var(--shadow)', flexShrink: 0 }}>
              <QRCodeSVG value={qrData} size={240} level="M" bgColor="#fff" fgColor="#1e293b" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--primary)' }}>{total} ₸</div>
              <div style={{ fontSize: 22, color: '#64748b', lineHeight: 1.35 }}>{t(lang, 'scanQR')} <strong>Kaspi.kz</strong></div>
              <div style={{ fontSize: 22, color: '#f59e0b', fontWeight: 700 }}>⏳ {min}:{sec.toString().padStart(2, '0')}</div>
              <div style={{ fontSize: 18, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
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
                  color: '#fff', border: 'none', borderRadius: 14,
                  padding: '16px 0', fontSize: 24, fontWeight: 800,
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
