/**
 * Kiosk configuration.
 *
 * На Pi эти значения задаются через переменные среды:
 *   VITE_API_URL=http://server-ip:8001
 *   VITE_MACHINE_ID=uuid-из-crm
 *
 * Для теста в браузере:
 *   1. Добавь аппарат в CRM → скопируй его ID (UUID)
 *   2. Создай файл kiosk-ui/.env.local:
 *      VITE_API_URL=http://localhost:8001
 *      VITE_MACHINE_ID=скопированный-uuid
 *   3. Перезапусти npm run dev
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export const MACHINE_ID = import.meta.env.VITE_MACHINE_ID || '';

// Polling interval for payment status (ms)
export const PAYMENT_POLL_INTERVAL = 3000;

// How long to show "pick up" screen before resetting (ms)
export const PICKUP_SCREEN_TIMEOUT = 30000;

// Idle timeout — go back to idle screen after inactivity (ms)
export const IDLE_TIMEOUT = 120000;
