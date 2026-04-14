import { t } from '../i18n';

function ProductCard({ item, cartQty, onAdd, lang }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 250,
    }} className="fade-in">
      <div style={{
        height: 130, background: '#f8f8f8', display: 'flex',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {item.product_image_url ? (
          <img src={item.product_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 58, opacity: 0.3 }}>📦</span>
        )}
      </div>
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>
          {item.product_name}
        </div>
        <div style={{ fontSize: 16, color: '#94a3b8', marginBottom: 10 }}>
          ×{item.quantity} {t(lang, 'inStock')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>
            {item.product_price} ₸
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(item); }}
            style={{
              background: cartQty > 0 ? '#16a34a' : 'var(--primary)',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 18px', fontSize: 22, fontWeight: 700, cursor: 'pointer',
              minWidth: 92,
            }}
          >
            {cartQty > 0 ? `${cartQty} +` : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogScreen({ lang, inventory, category, cart, onAdd, onBack }) {
  return (
    <div style={{ height: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{
          background: 'none', border: '2px solid #e2e8f0', borderRadius: 12,
          padding: '10px 16px', fontSize: 20, cursor: 'pointer', color: '#64748b', fontWeight: 700,
        }}>{t(lang, 'back')}</button>
        <span style={{ fontSize: 28, fontWeight: 800 }}>{t(lang, category)}</span>
      </div>
      {inventory.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 24,
        }}>
          <div style={{ fontSize: 64 }}>📭</div>
          <div>{t(lang, 'noProducts')}</div>
        </div>
      ) : (
        <div style={{
          flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16, padding: '0 18px 18px', overflowY: 'auto', alignContent: 'start',
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
