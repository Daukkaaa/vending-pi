"""
GPIO controller for electric lock, door sensor and LEDs.
"""

import asyncio
import logging
import platform
import os

logger = logging.getLogger(__name__)

IS_PI = platform.machine().startswith('aarch64') or platform.machine().startswith('arm')
LOCK_INVERTED = os.getenv('LOCK_INVERTED', 'false').lower() in ('true', '1', 'yes')
DOOR_CLOSED_STATE = int(os.getenv('DOOR_CLOSED_STATE', '0'))
WHITE_LED_PIN = int(os.getenv('WHITE_LED_PIN', '0'))
GREEN_LED_PIN = int(os.getenv('GREEN_LED_PIN', '0'))
RED_LED_PIN = int(os.getenv('RED_LED_PIN', '0'))


class GPIOController:
    def __init__(self, lock_pin: int, door_sensor_pin: int):
        self.lock_pin = lock_pin
        self.door_sensor_pin = door_sensor_pin
        self._lock_task = None
        self._on_door_close = None
        self._on_door_open = None
        self._gpio_ready = False

        if LOCK_INVERTED:
            self.LOCKED = 0
            self.UNLOCKED = 1
        else:
            self.LOCKED = 1
            self.UNLOCKED = 0

    def setup(self):
        if not IS_PI:
            logger.warning('Not running on Pi, GPIO in simulation mode')
            return

        try:
            import RPi.GPIO as GPIO
            GPIO.setmode(GPIO.BCM)
            GPIO.setwarnings(False)

            GPIO.setup(self.lock_pin, GPIO.OUT)
            GPIO.output(self.lock_pin, self.LOCKED)

            GPIO.setup(self.door_sensor_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            GPIO.add_event_detect(self.door_sensor_pin, GPIO.BOTH, callback=self._door_callback, bouncetime=200)

            for pin in [WHITE_LED_PIN, GREEN_LED_PIN, RED_LED_PIN]:
                if pin > 0:
                    GPIO.setup(pin, GPIO.OUT)
                    GPIO.output(pin, GPIO.LOW)

            self._gpio_ready = True
            self.set_led_mode('white')
            self.close_lock()
            logger.info(f'GPIO ready, lock=GPIO{self.lock_pin}, door=GPIO{self.door_sensor_pin}')
        except Exception as e:
            logger.error(f'GPIO setup failed: {e}')
            logger.warning('Running in simulation mode')

    def _door_callback(self, channel):
        import RPi.GPIO as GPIO
        state = GPIO.input(self.door_sensor_pin)
        is_closed = state == DOOR_CLOSED_STATE
        if is_closed:
            logger.info('Door sensor: CLOSED')
            self.close_lock()
            if self._on_door_close:
                self._on_door_close()
        else:
            logger.info('Door sensor: OPENED')
            if self._on_door_open:
                self._on_door_open()

    def set_door_callbacks(self, on_close=None, on_open=None):
        self._on_door_close = on_close
        self._on_door_open = on_open

    def set_led_mode(self, mode: str):
        logger.info(f'LED mode: {mode}')
        if not self._gpio_ready:
            return
        try:
            import RPi.GPIO as GPIO
            pins = {
                'white': WHITE_LED_PIN,
                'green': GREEN_LED_PIN,
                'red': RED_LED_PIN,
            }
            for _, pin in pins.items():
                if pin > 0:
                    GPIO.output(pin, GPIO.LOW)
            pin = pins.get(mode)
            if pin and pin > 0:
                GPIO.output(pin, GPIO.HIGH)
        except Exception as e:
            logger.error(f'Failed to set LED mode {mode}: {e}')

    async def open_lock(self, duration: int = 20) -> bool:
        logger.info(f'UNLOCKING for {duration}s')
        if not self._gpio_ready:
            await asyncio.sleep(min(duration, 5))
            return True
        try:
            import RPi.GPIO as GPIO
            if self._lock_task and not self._lock_task.done():
                self._lock_task.cancel()
            GPIO.output(self.lock_pin, self.UNLOCKED)
            self._lock_task = asyncio.ensure_future(self._auto_lock(duration))
            return True
        except Exception as e:
            logger.error(f'Failed to unlock: {e}')
            return False

    async def _auto_lock(self, duration: int):
        try:
            await asyncio.sleep(duration)
            if self.is_door_closed():
                self.close_lock()
        except asyncio.CancelledError:
            pass

    def close_lock(self):
        if self._gpio_ready:
            try:
                import RPi.GPIO as GPIO
                GPIO.output(self.lock_pin, self.LOCKED)
            except Exception as e:
                logger.error(f'Failed to lock: {e}')
        logger.info('LOCKED')

    def is_door_closed(self) -> bool:
        if not self._gpio_ready:
            return True
        try:
            import RPi.GPIO as GPIO
            return GPIO.input(self.door_sensor_pin) == DOOR_CLOSED_STATE
        except Exception:
            return True

    def cleanup(self):
        if self._gpio_ready:
            try:
                import RPi.GPIO as GPIO
                self.close_lock()
                GPIO.cleanup()
            except Exception:
                pass
        logger.info('GPIO cleaned up')
