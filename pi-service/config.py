"""Pi Service configuration."""

import os
from dotenv import load_dotenv

load_dotenv()

# Server connection
SERVER_URL = os.getenv("SERVER_URL", "ws://localhost:8000")
API_URL = os.getenv("API_URL", "http://localhost:8000")
MACHINE_ID = os.getenv("MACHINE_ID", "")
MACHINE_TOKEN = os.getenv("MACHINE_TOKEN", "")
CATALOG_PATH = os.getenv("CATALOG_PATH", "/home/rpi/vending-machine/kiosk-ui/public/catalog.json")

# GPIO pins (BCM numbering)
SERVO_PIN = int(os.getenv("SERVO_PIN", "17"))        # SG90 servo (test lock)
DOOR_SENSOR_PIN = int(os.getenv("DOOR_SENSOR_PIN", "27"))  # Reed switch

# Lock timing
DEFAULT_LOCK_DURATION = int(os.getenv("LOCK_DURATION", "30"))  # seconds

# Heartbeat interval
HEARTBEAT_INTERVAL = int(os.getenv("HEARTBEAT_INTERVAL", "30"))  # seconds

# Reconnect settings
RECONNECT_DELAY = 5      # seconds between reconnect attempts
MAX_RECONNECT_DELAY = 60  # max backoff

# Kiosk UI
KIOSK_UI_DIR = os.getenv("KIOSK_UI_DIR", "/home/rpi/kiosk-ui/dist")
KIOSK_UI_PORT = int(os.getenv("KIOSK_UI_PORT", "5173"))
