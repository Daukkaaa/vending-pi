import { useState, useEffect, useCallback, useRef } from 'react';
import CategoriesScreen from './screens/CategoriesScreen';
import CatalogScreen from './screens/CatalogScreen';
import CartScreen from './screens/CartScreen';
import PaymentScreen from './screens/PaymentScreen';
import PickupScreen from './screens/PickupScreen';
import ErrorScreen from './screens/ErrorScreen';
import IdleScreen from './screens/IdleScreen';
import Header from './components/Header';
import { getInventory } from './api';
import { IDLE_TIMEOUT, MACHINE_ID } from './config';

const SCREENS = {
  IDLE: 'idle',
  CATEGORIES: 'categories',
  CATALOG: 'catalog',
  CART: 'cart',
  PAYMENT: 'payment',
  PICKUP: 'pickup',
  ERROR: 'error',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.IDLE);
  const [lang, setLang] = useState('ru');
  const [inventory, setInventory] = useState([]);
  const [category, setCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const idleTimer = useRef(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (screen !== SCREENS.IDLE && !dispensing) {
      idleTimer.current = setTimeout(() => {
        setScreen(SCREENS.IDLE);
        setCart([]);
      }, IDLE_TIMEOUT);
    }
  }, [screen, dispensing]);

  useEffect(() => {
    const handler = () => resetIdleTimer();
    window.addEventListener('touchstart', handler);
    window.addEventListener('click', handler);
    return () => {
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('click', handler);
    };
  }, [resetIdleTimer]);

  const loadInventory = useCallback(async () => {
    if (!MACHINE_ID) {
      setError('Machine ID не настроен');
      setScreen(SCREENS.ERROR);
      return;
    }
    try {
      setLoading(true);
      const items = await getInventory();
      setInventory(items.filter(i => i.quantity > 0));
    } catch (e) {
      setError('Не удалось загрузить каталог');
      setScreen(SCREENS.ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectLang = useCallback((code) => {
    setLang(code);
    setCart([]);
    setCategory('');
    setScreen(SCREENS.CATEGORIES);
    loadInventory();
    resetIdleTimer();
  }, [loadInventory, resetIdleTimer]);

  const goHome = useCallback(() => {
    if (dispensing) return;
    setCart([]);
    setCategory('');
    setScreen(SCREENS.IDLE);
  }, [dispensing]);

  const addToCart = useCallback((item) => {
    if (dispensing) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        if (existing.qty >= item.quantity) return prev;
        return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    resetIdleTimer();
  }, [resetIdleTimer, dispensing]);

  const removeFromCart = useCallback((itemId) => {
    if (dispensing) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (existing && existing.qty > 1) {
        return prev.map(c => c.id === itemId ? { ...c, qty: c.qty - 1 } : c);
      }
      return prev.filter(c => c.id !== itemId);
    });
    resetIdleTimer();
  }, [resetIdleTimer, dispensing]);

  const cartTotal = cart.reduce((sum, c) => sum + c.product_price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const categories = [...new Set(inventory.map(i => i.product_category).filter(Boolean))];

  const handlePaymentSuccess = useCallback((order) => {
    setOrderData(order);
    setDispensing(true);
    setScreen(SCREENS.PICKUP);
  }, []);

  const handleReset = useCallback(() => {
    setCart([]);
    setOrderData(null);
    setError('');
    setDispensing(false);
    setScreen(SCREENS.CATEGORIES);
    loadInventory();
    resetIdleTimer();
  }, [loadInventory, resetIdleTimer]);

  const handleError = useCallback((msg) => {
    setError(msg);
    setScreen(SCREENS.ERROR);
  }, []);

  if (dispensing && screen !== SCREENS.PICKUP) {
    return <PickupScreen lang={lang} order={orderData} onDone={handleReset} />;
  }

  if (screen === SCREENS.IDLE) {
    return <IdleScreen lang={lang} onSelectLang={handleSelectLang} />;
  }

  if (screen === SCREENS.PICKUP) {
    return <PickupScreen lang={lang} order={orderData} onDone={handleReset} />;
  }

  // All other screens get the persistent header
  const headerProps = { lang, cartCount, cartTotal, onHome: goHome, onGoCart: () => setScreen(SCREENS.CART) };

  switch (screen) {
    case SCREENS.CATEGORIES:
      return (
        <>
          <Header {...headerProps} />
          <CategoriesScreen lang={lang} categories={categories} loading={loading} onSelect={(cat) => { setCategory(cat); setScreen(SCREENS.CATALOG); resetIdleTimer(); }} />
        </>
      );
    case SCREENS.CATALOG:
      return (
        <>
          <Header {...headerProps} />
          <CatalogScreen lang={lang} inventory={inventory.filter(i => i.product_category === category)} category={category} cart={cart} onAdd={addToCart} onBack={() => setScreen(SCREENS.CATEGORIES)} />
        </>
      );
    case SCREENS.CART:
      return (
        <>
          <Header {...headerProps} />
          <CartScreen lang={lang} cart={cart} total={cartTotal} onAdd={addToCart} onRemove={removeFromCart} onClear={() => setCart([])} onBack={() => setScreen(SCREENS.CATALOG)} onCheckout={() => setScreen(SCREENS.PAYMENT)} />
        </>
      );
    case SCREENS.PAYMENT:
      return (
        <>
          <Header {...headerProps} />
          <PaymentScreen lang={lang} cart={cart} total={cartTotal} onSuccess={handlePaymentSuccess} onError={handleError} onCancel={() => setScreen(SCREENS.CART)} />
        </>
      );
    case SCREENS.ERROR:
      return (
        <>
          <Header {...headerProps} />
          <ErrorScreen lang={lang} message={error} onRetry={handleReset} />
        </>
      );
    default:
      return <IdleScreen lang={lang} onSelectLang={handleSelectLang} />;
  }
}
