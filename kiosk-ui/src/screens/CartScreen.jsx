/* Cart — Marketa, 800x480 */
import { t } from '../i18n';

function CartItem({ item, onAdd, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#fff', borderRadius: 10, padding: '8px 12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {item.product_image_url && (
        <img src={item.product_image_url} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product_name}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.product_price} ₸</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onRemove(item.id)} style={{
          width: 28, height: 28, borderRadius: 7, border: '1px solid #e2e8f0',
          background: '#f8fafc', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>−</button>
        <span style={{ fontSize: 14, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
        <button onClick={() => onAdd(item)} style={{
          width: 28, height: 28, borderRadius: 7, border: 'none',
          background: 'var(--primary)', color: '#fff', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>+</button>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, minWidth: 60, textAlign: 'right' }}>
        {item.product_price * item.qty} ₸
      </div>
    </div>
  );
}

export default function CartScreen({ lang, cart, total, onAdd, onRemove, onClear, onBack, onCheckout }) {
  return (
    <div style={{ height: 'calc(100vh - 44px)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{
        padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
          padding: '4px 10px', fontSize: 13, cursor: 'pointer', color: '#64748b', fontWeight: 600,
        }}>{t(lang, 'back')}</button>
        <span style={{ fontSize: 16, fontWeight: 700 }}>🛒 {t(lang, 'cart')}</span>
        <button onClick={onClear} style={{
          background: 'none', border: '1px solid #fecaca', borderRadius: 8,
          padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#dc2626', fontWeight: 600,
        }}>{t(lang, 'clear')}</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {cart.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
          }}>
            <div style={{ fontSize: 36 }}>🛒</div>
            <div>{t(lang, 'cartEmpty')}</div>
          </div>
        ) : cart.map(item => (
          <CartItem key={item.id} item={item} onAdd={onAdd} onRemove={onRemove} />
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{
          padding: '8px 16px', background: '#fff', borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{t(lang, 'total')}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{total} ₸</div>
          </div>
          <button onClick={onCheckout} style={{
            background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 12,
            padding: '10px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(253,52,52,0.3)',
          }}>{t(lang, 'pay')}</button>
        </div>
      )}
    </div>
  );
}
