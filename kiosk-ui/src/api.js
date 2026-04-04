import { API_URL, MACHINE_ID } from './config';

async function request(path, options = {}) {
  const url = `${API_URL}/api/v1${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

/** Get inventory for this machine (products + slots + quantities) */
export function getInventory() {
  return request(`/machines/${MACHINE_ID}/inventory`);
}

/** Create an order */
export function createOrder(productId, slotNumber) {
  return request('/orders/', {
    method: 'POST',
    body: JSON.stringify({
      machine_id: MACHINE_ID,
      product_id: productId,
      slot_number: slotNumber,
    }),
  });
}

/** Create payment for an order → returns QR data */
export function createPayment(orderId) {
  return request(`/payments/${orderId}/create`, { method: 'POST' });
}

/** Poll payment status */
export function getPaymentStatus(orderId) {
  return request(`/payments/${orderId}/status`);
}

/** Get order details */
export function getOrder(orderId) {
  return request(`/orders/${orderId}`);
}

/** Simulate Kaspi payment (dev/test — triggers webhook internally) */
export function simulatePayment(orderNumber) {
  return request('/payments/webhook/kaspi', {
    method: 'POST',
    body: JSON.stringify({
      payment_id: 'KP-SIM-' + Date.now(),
      order_number: orderNumber,
      status: 'completed',
    }),
  });
}
