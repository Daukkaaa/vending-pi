import { t } from '../i18n';

export default function PickupScreen({ lang, order, onDone, doorFlow, doorClosed, secondsLeft }) {
  const isWaitClose = doorFlow === 'wait_close';
  const title = isWaitClose ? 'Закройте дверь' : 'Можете забрать товар';
  const subtitle = isWaitClose
    ? 'Пожалуйста, закройте дверь холодильника, чтобы продолжить'
    : doorClosed
      ? 'Откройте дверь и заберите товар'
      : 'Заберите товар и закройте дверь';

  return (
    <div className="pickup-screen-root fade-in" style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: isWaitClose
        ? 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)'
        : 'linear-gradient(135deg, #059669 0%, #16a34a 100%)',
      color: '#fff', textAlign: 'center', padding: 32,
    }}>
      <div style={{ fontSize: 96, marginBottom: 18 }} className="pulse">{isWaitClose ? '🚪' : '✅'}</div>
      <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 18, lineHeight: 1.1 }}>{title}</div>
      <div style={{ fontSize: 28, opacity: 0.98, marginBottom: 24, maxWidth: 720, lineHeight: 1.3 }}>{subtitle}</div>

      {order?.order_number && (
        <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 18, padding: '14px 28px', fontSize: 22, fontWeight: 700, marginBottom: 18 }}>
          {t(lang, 'order')}: {order.order_number}
        </div>
      )}

      <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
        Дверь: {doorClosed ? 'закрыта' : 'открыта'}
      </div>

      {!isWaitClose && (
        <div style={{ fontSize: 24, opacity: 0.95 }}>
          Время на получение: {secondsLeft} сек
        </div>
      )}

      {isWaitClose && (
        <div style={{ marginTop: 16, fontSize: 24, fontWeight: 700, background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.35)', borderRadius: 16, padding: '16px 24px' }}>
          Новая покупка будет доступна только после закрытия двери
        </div>
      )}
    </div>
  );
}
