"""
GPIO controller for electric lock.

Wiring:
  Raspberry Pi GPIO17 → Relay module IN
  Raspberry Pi 5V     → Relay module VCC
  Raspberry Pi GND    → Relay module GND
  Relay               → Electric Lock + PSU

Logic (configurable):
  LOCKED_STATE = HIGH (default) — GPIO HIGH = relay energized = lock HOLDS
  To unlock: set GPIO LOW for N seconds, then back to HIGH
  
  If your relay is inverted, set LOCK_INVERTED=true in .env
"""

import asyncio
import logging
import platform
import os

logger = logging.getLogger(__name__)

IS_PI = platform.machine().startswith('aarch64') or platform.machine().startswith('arm')

# Check if lock logic should be inverted
LOCK_INVERTED = os.getenv('LOCK_INVERTED', 'false').lower() in ('true', '1', 'yes')


class GPIOController:
    """Controls electric lock via relay module on a single GPIO pin."""

    def __init__(self, lock_pin: int, door_sensor_pin: int):
        self.lock_pin = lock_pin
        self.door_sensor_pin = door_sensor_pin
        self._lock_task = None
        self._on_door_close = None
        self._on_door_open = None
        self._gpio_ready = False
        
        # Determine lock/unlock states
        # Default: HIGH = locked, LOW = unlocked
        # Inverted: LOW = locked, HIGH = unlocked
        if LOCK_INVERTED:
            self.LOCKED = 0   # GPIO.LOW
            self.UNLOCKED = 1 # GPIO.HIGH
        else:
            self.LOCKED = 1   # GPIO.HIGH
            self.UNLOCKED = 0 # GPIO.LOW

    def setup(self):
        """Initialize GPIO pins."""
        if not IS_PI:
            logger.warning("Not running on Pi — GPIO in SIMULATION mode")
            return

        try:
            import RPi.GPIO as GPIO

            GPIO.setmode(GPIO.BCM)
            GPIO.setwarnings(False)

            # Lock pin — start LOCKED
            GPIO.setup(self.lock_pin, GPIO.OUT)
            GPIO.output(self.lock_pin, self.LOCKED)
            inv = " (INVERTED)" if LOCK_INVERTED else ""
            logger.info(f"🔒 Electric lock on GPIO{self.lock_pin} — LOCKED (GPIO {'LOW' if self.LOCKED == 0 else 'HIGH'}){inv}")

            # Door sensor (reed switch) — optional
            try:
                GPIO.setup(self.door_sensor_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
                GPIO.add_event_detect(
                    self.door_sensor_pin, GPIO.BOTH,
                    callback=self._door_callback, bouncetime=200
                )
                logger.info(f"Door sensor on GPIO{self.door_sensor_pin}")
            except Exception as e:
                logger.warning(f"Door sensor not available: {e} (continuing without it)")

            self._gpio_ready = True

        except Exception as e:
            logger.error(f"GPIO setup failed: {e}")
            logger.warning("Running in simulation mode")

    def _door_callback(self, channel):
        """Called by RPi.GPIO on door sensor state change."""
        import RPi.GPIO as GPIO
        state = GPIO.input(self.door_sensor_pin)
        if state == GPIO.LOW:
            logger.info("Door sensor: CLOSED")
            if self._on_door_close:
                self._on_door_close()
        else:
            logger.info("Door sensor: OPENED")
            if self._on_door_open:
                self._on_door_open()

    def set_door_callbacks(self, on_close=None, on_open=None):
        self._on_door_close = on_close
        self._on_door_open = on_open

    async def open_lock(self, duration: int = 20) -> bool:
        """
        Unlock for `duration` seconds, then automatically re-lock.
        """
        logger.info(f"🔓 UNLOCKING for {duration}s")

        if not self._gpio_ready:
            logger.info(f"[SIM] Unlock for {duration}s")
            await asyncio.sleep(min(duration, 5))
            logger.info("[SIM] Re-locked")
            return True

        try:
            import RPi.GPIO as GPIO

            # Cancel any pending auto-lock
            if self._lock_task and not self._lock_task.done():
                self._lock_task.cancel()

            # UNLOCK
            GPIO.output(self.lock_pin, self.UNLOCKED)
            logger.info(f"🔓 GPIO {'LOW' if self.UNLOCKED == 0 else 'HIGH'} — UNLOCKED")

            # Auto re-lock after duration
            self._lock_task = asyncio.ensure_future(self._auto_lock(duration))
            return True

        except Exception as e:
            logger.error(f"Failed to unlock: {e}")
            return False

    async def _auto_lock(self, duration: int):
        """Re-lock after timeout."""
        try:
            await asyncio.sleep(duration)
            self.close_lock()
        except asyncio.CancelledError:
            pass

    def close_lock(self):
        """Immediately lock."""
        if self._gpio_ready:
            try:
                import RPi.GPIO as GPIO
                GPIO.output(self.lock_pin, self.LOCKED)
            except Exception as e:
                logger.error(f"Failed to lock: {e}")
        logger.info(f"🔒 GPIO {'LOW' if self.LOCKED == 0 else 'HIGH'} — LOCKED")

    def is_door_closed(self) -> bool:
        if not self._gpio_ready:
            return True
        try:
            import RPi.GPIO as GPIO
            return GPIO.input(self.door_sensor_pin) == GPIO.LOW
        except:
            return True

    def cleanup(self):
        if self._gpio_ready:
            try:
                import RPi.GPIO as GPIO
                GPIO.output(self.lock_pin, self.LOCKED)  # Lock before cleanup
                GPIO.cleanup()
            except:
                pass
        logger.info("GPIO cleaned up")
