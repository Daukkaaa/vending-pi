#!/usr/bin/env python3
"""
Smart Vending Machine — Pi Service
Main entry point. Runs on Raspberry Pi 4.

Responsibilities:
  1. WebSocket client → persistent connection to backend
  2. GPIO control → relay (lock) + door sensor (reed switch)
  3. Heartbeat every 30s
  4. Handle commands from server (open_lock, update_catalog)
"""

import asyncio
import logging
import signal
import sys
import os

from config import MACHINE_ID, SERVO_PIN, DOOR_SENSOR_PIN, DEFAULT_LOCK_DURATION, MOCK_HARDWARE
from gpio_controller import GPIOController
from ws_client import WSClient
from catalog_cache import write_catalog

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("/tmp/pi-service.log"),
    ],
)
logger = logging.getLogger("pi-service")

# State
current_order_id = None
pickup_deadline = None
gpio = GPIOController(lock_pin=SERVO_PIN, door_sensor_pin=DOOR_SENSOR_PIN)
ws: WSClient = None


async def handle_command(data: dict):
    """Process commands from the backend server."""
    global current_order_id, pickup_deadline

    cmd_type = data.get("type")

    if cmd_type == "open_lock":
        order_id = data.get("order_id")
        slot_number = data.get("slot_number", 1)
        duration = data.get("duration_seconds", DEFAULT_LOCK_DURATION)

        logger.info(f"🔓 OPEN_LOCK: order={order_id}, slot={slot_number}, duration={duration}s")
        current_order_id = order_id
        pickup_deadline = asyncio.get_event_loop().time() + duration
        gpio.set_led_mode('green')

        success = await gpio.open_lock(duration)

        if success:
            await ws.send_lock_confirmed(order_id)
            logger.info(f"✅ Lock opened for order {order_id}")
        else:
            await ws.send_error(f"Failed to open lock for order {order_id}")
            logger.error(f"❌ Failed to open lock for order {order_id}")

    elif cmd_type == "update_catalog":
        products = data.get("products", [])
        logger.info(f"📦 Catalog update: {len(products)} products")
        write_catalog(products)
        logger.info("✅ Catalog cache updated for kiosk UI")

    elif cmd_type == "door_closed_ack":
        logger.info(f"Server acknowledged door close for order {data.get('order_id')}")

    else:
        logger.warning(f"Unknown command: {cmd_type}")


def on_door_close():
    """Called by GPIO when door sensor detects door closed."""
    global current_order_id, pickup_deadline
    gpio.close_lock()
    gpio.set_led_mode('white')
    if current_order_id:
        logger.info(f"🚪 Door closed → locking + notifying server (order: {current_order_id})")
        asyncio.get_event_loop().create_task(ws.send_door_closed(current_order_id))
        current_order_id = None
        pickup_deadline = None


def on_door_open():
    """Called by GPIO when door sensor detects door opened."""
    global pickup_deadline
    if current_order_id:
        logger.info(f"🚪 Door opened (order: {current_order_id})")
        gpio.set_led_mode('green')
        asyncio.get_event_loop().create_task(ws.send_door_opened(current_order_id))

    if pickup_deadline and asyncio.get_event_loop().time() > pickup_deadline:
        gpio.set_led_mode('red')


async def main():
    global ws

    if not MACHINE_ID:
        logger.error("❌ MACHINE_ID not set! Configure .env file.")
        sys.exit(1)

    logger.info(f"🚀 Pi Service starting for machine: {MACHINE_ID}")
    logger.info(f"   Servo: GPIO{SERVO_PIN}, Door sensor: GPIO{DOOR_SENSOR_PIN}, mock={MOCK_HARDWARE}")

    # Initialize GPIO
    gpio.setup()
    gpio.set_door_callbacks(on_close=on_door_close, on_open=on_door_open)

    # Initialize WebSocket client
    ws = WSClient(on_command=handle_command)

    # Handle graceful shutdown
    def shutdown(sig, frame):
        logger.info(f"Received signal {sig}, shutting down...")
        gpio.cleanup()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    gpio.set_led_mode('white')

    # Start WebSocket connection (runs forever with auto-reconnect)
    try:
        await ws.connect()
    except KeyboardInterrupt:
        pass
    finally:
        gpio.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
