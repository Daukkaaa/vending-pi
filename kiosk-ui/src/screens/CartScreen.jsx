import { t } from '../i18n';

function CartItem({ item, onAdd, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: '#fff', borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {item.product_image_url && (
        <img src={item.product_image_url} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{item.product_name}</div>
        <div style={{ fontSize: 18, color: '#94a3b8' }}>{item.product_price} ₸</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => onRemove(item.id)} style={{
          width: 46, height: 46, borderRadius: 12, border: '2px solid #e2e8f0',
          background: '#f8fafc', fontSize: 26, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>−</button>
        <span style={{ fontSize: 24, fontWeight: 800, minWidth: 28, textAlign: 'center' }}>{item.qty}</span>
        <button onClick={() => onAdd(item)} style={{
          width: 46, height: 46, borderRadius: 12, border: 'none',
          background: 'var(--primary)', color: '#fff', fontSize: 26, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>+</button>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, minWidth: 92, textAlign: 'right' }}>
        {item.product_price * item.qty} ₸
      </div>
    </div>
  );
}

export default function CartScreen({ lang, cart, total, onAdd, onRemove, onClear, onBack, onCheckout }) {
  return (
    <div style={{ height: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{
          background: 'none', border: '2px solid #e2e8f0', borderRadius: 12,
          padding: '10px 16px', fontSize: 20, cursor: 'pointer', color: '#64748b', fontWeight: 700,
        }}>{t(lang, 'back')}</button>
        <span style={{ fontSize: 28, fontWeight: 800 }}>🛒 {t(lang, 'cart')}</span>
        <button onClick={onClear} style={{
          background: 'none', border: '2px solid #fecaca', borderRadius: 12,
          padding: '10px 16px', fontSize: 18, cursor: 'pointer', color: '#dc2626', fontWeight: 700,
        }}>{t(lang, 'clear')}</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cart.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 24,
          }}>
            <div style={{ fontSize: 64 }}>🛒</div>
            <div>{t(lang, 'cartEmpty')}</div>
          </div>
        ) : cart.map(item => (
          <CartItem key={item.id} item={item} onAdd={onAdd} onRemove={onRemove} />
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{
          padding: '14px 18px', background: '#fff', borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 16, color: '#94a3b8' }}>{t(lang, 'total')}</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--primary)' }}>{total} ₸</div>
          </div>
          <button onClick={onCheckout} style={{
            background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 16,
            padding: '16px 30px', fontSize: 24, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(253,52,52,0.3)',
          }}>{t(lang, 'pay')}</button>
        </div>
      )}
    </div>
  );
}
