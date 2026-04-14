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
import { getLocalCatalog } from './catalog';
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

const DOOR_STATES = {
  IDLE: 'idle',
  READY_TO_TAKE: 'ready_to_take',
  WAIT_CLOSE: 'wait_close',
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
  const [doorFlow, setDoorFlow] = useState(DOOR_STATES.IDLE);
  const [doorClosed, setDoorClosed] = useState(true);
  const [pickupSecondsLeft, setPickupSecondsLeft] = useState(30);
  const idleTimer = useRef(null);
  const pickupTimer = useRef(null);

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
      let items = [];
      try {
        items = await getLocalCatalog();
      } catch {
        items = await getInventory();
      }
      setInventory(items.filter(i => i.quantity > 0));
    } catch (e) {
      setError('Не удалось загрузить каталог');
      setScreen(SCREENS.ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
    const interval = setInterval(() => {
      loadInventory();
      try {
        const state = JSON.parse(localStorage.getItem('door-state') || '{}');
        setDoorClosed(state.doorClosed ?? true);
        if (state.dispensing) {
          setDispensing(true);
          setDoorFlow(state.doorFlow || DOOR_STATES.READY_TO_TAKE);
          setPickupSecondsLeft(state.pickupSecondsLeft ?? 30);
          setOrderData(state.orderData || null);
          setScreen(SCREENS.PICKUP);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [loadInventory]);

  useEffect(() => {
    const snapshot = {
      dispensing,
      doorFlow,
      doorClosed,
      pickupSecondsLeft,
      orderData,
    };
    localStorage.setItem('door-state', JSON.stringify(snapshot));
  }, [dispensing, doorFlow, doorClosed, pickupSecondsLeft, orderData]);

  useEffect(() => {
    if (!dispensing) {
      if (pickupTimer.current) clearInterval(pickupTimer.current);
      return;
    }
    if (pickupTimer.current) clearInterval(pickupTimer.current);
    pickupTimer.current = setInterval(() => {
      setPickupSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(pickupTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(pickupTimer.current);
  }, [dispensing]);

  useEffect(() => {
    if (!dispensing) return;
    if (pickupSecondsLeft <= 0 && !doorClosed) {
      setDoorFlow(DOOR_STATES.WAIT_CLOSE);
    }
  }, [pickupSecondsLeft, dispensing, doorClosed]);

  useEffect(() => {
    if (!dispensing) return;
    if (doorClosed) {
      if (pickupSecondsLeft > 0) {
        setDoorFlow(DOOR_STATES.READY_TO_TAKE);
      } else {
        setDispensing(false);
        setDoorFlow(DOOR_STATES.IDLE);
        setOrderData(null);
        setCart([]);
        setScreen(SCREENS.CATEGORIES);
        loadInventory();
      }
    }
  }, [doorClosed, pickupSecondsLeft, dispensing, loadInventory]);

  const handleSelectLang = useCallback((code) => {
    if (dispensing && !doorClosed) return;
    setLang(code);
    setCart([]);
    setCategory('');
    setScreen(SCREENS.CATEGORIES);
    loadInventory();
    resetIdleTimer();
  }, [loadInventory, resetIdleTimer, dispensing, doorClosed]);

  const goHome = useCallback(() => {
    if (dispensing || !doorClosed) return;
    setCart([]);
    setCategory('');
    setScreen(SCREENS.IDLE);
  }, [dispensing, doorClosed]);

  const addToCart = useCallback((item) => {
    if (dispensing || !doorClosed) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        if (existing.qty >= item.quantity) return prev;
        return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    resetIdleTimer();
  }, [resetIdleTimer, dispensing, doorClosed]);

  const removeFromCart = useCallback((itemId) => {
    if (dispensing || !doorClosed) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (existing && existing.qty > 1) {
        return prev.map(c => c.id === itemId ? { ...c, qty: c.qty - 1 } : c);
      }
      return prev.filter(c => c.id !== itemId);
    });
    resetIdleTimer();
  }, [resetIdleTimer, dispensing, doorClosed]);

  const cartTotal = cart.reduce((sum, c) => sum + c.product_price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const categories = [...new Set(inventory.map(i => i.product_category).filter(Boolean))];

  const handlePaymentSuccess = useCallback((order) => {
    setOrderData(order);
    setPickupSecondsLeft(30);
    setDoorFlow(DOOR_STATES.READY_TO_TAKE);
    setDispensing(true);
    setScreen(SCREENS.PICKUP);
  }, []);

  const handleReset = useCallback(() => {
    if (!doorClosed) return;
    setCart([]);
    setOrderData(null);
    setError('');
    setDispensing(false);
    setDoorFlow(DOOR_STATES.IDLE);
    setPickupSecondsLeft(30);
    setScreen(SCREENS.CATEGORIES);
    loadInventory();
    resetIdleTimer();
  }, [loadInventory, resetIdleTimer, doorClosed]);

  const handleError = useCallback((msg) => {
    setError(msg);
    setScreen(SCREENS.ERROR);
  }, []);

  if (dispensing && screen !== SCREENS.PICKUP) {
    return <PickupScreen lang={lang} order={orderData} onDone={handleReset} doorFlow={doorFlow} doorClosed={doorClosed} secondsLeft={pickupSecondsLeft} />;
  }

  if (screen === SCREENS.IDLE) {
    return <IdleScreen lang={lang} onSelectLang={handleSelectLang} />;
  }

  if (screen === SCREENS.PICKUP) {
    return <PickupScreen lang={lang} order={orderData} onDone={handleReset} doorFlow={doorFlow} doorClosed={doorClosed} secondsLeft={pickupSecondsLeft} />;
  }

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
