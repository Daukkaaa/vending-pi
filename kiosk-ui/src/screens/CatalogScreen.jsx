/* Products in category — Marketa, 800x480 */
import { t } from '../i18n';

function ProductCard({ item, cartQty, onAdd, lang }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }} className="fade-in">
      <div style={{
        height: 90, background: '#f8f8f8', display: 'flex',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {item.product_image_url ? (
          <img src={item.product_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 40, opacity: 0.3 }}>📦</span>
        )}
      </div>
      <div style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, marginBottom: 2 }}>
          {item.product_name}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
          ×{item.quantity} {t(lang, 'inStock')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
            {item.product_price} ₸
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(item); }}
            style={{
              background: cartQty > 0 ? '#16a34a' : 'var(--primary)',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '5px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {cartQty > 0 ? `${cartQty} +` : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogScreen({ lang, inventory, category, cart, onAdd, onBack }) {
  return (
    <div style={{ height: 'calc(100vh - 44px)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{
        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
          padding: '4px 10px', fontSize: 13, cursor: 'pointer', color: '#64748b', fontWeight: 600,
        }}>{t(lang, 'back')}</button>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{t(lang, category)}</span>
      </div>
      {inventory.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
        }}>
          <div style={{ fontSize: 36 }}>📭</div>
          <div>{t(lang, 'noProducts')}</div>
        </div>
      ) : (
        <div style={{
          flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10, padding: '0 12px 12px', overflowY: 'auto', alignContent: 'start',
        }}>
          {inventory.map(item => {
            const cq = cart.find(c => c.id === item.id)?.qty || 0;
            return <ProductCard key={item.id} item={item} cartQty={cq} onAdd={onAdd} lang={lang} />;
          })}
        </div>
      )}
    </div>
  );
}
