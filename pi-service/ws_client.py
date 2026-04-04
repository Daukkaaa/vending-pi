"""WebSocket client — persistent connection to the backend server."""

import asyncio
import json
import logging
from typing import Callable, Optional

import websockets

from config import (
    SERVER_URL, MACHINE_ID, MACHINE_TOKEN,
    HEARTBEAT_INTERVAL, RECONNECT_DELAY, MAX_RECONNECT_DELAY,
)

logger = logging.getLogger(__name__)


class WSClient:
    """Manages WebSocket connection to the vending machine backend."""

    def __init__(self, on_command: Callable):
        """
        Args:
            on_command: async callback(command_dict) called for each server message
        """
        self.on_command = on_command
        self._ws: Optional[websockets.WebSocketClientProtocol] = None
        self._connected = False
        self._reconnect_delay = RECONNECT_DELAY

    @property
    def is_connected(self) -> bool:
        return self._connected

    def _build_url(self) -> str:
        url = f"{SERVER_URL}/ws/machine/{MACHINE_ID}"
        if MACHINE_TOKEN:
            url += f"?token={MACHINE_TOKEN}"
        return url

    async def connect(self):
        """Connect and maintain connection with auto-reconnect."""
        while True:
            try:
                url = self._build_url()
                logger.info(f"🔌 Connecting to {url}")

                async with websockets.connect(
                    url,
                    ping_interval=20,
                    ping_timeout=10,
                    close_timeout=5,
                ) as ws:
                    self._ws = ws
                    self._connected = True
                    self._reconnect_delay = RECONNECT_DELAY
                    logger.info("✅ WebSocket connected!")

                    # Run heartbeat and listener concurrently
                    await asyncio.gather(
                        self._heartbeat_loop(ws),
                        self._receive_loop(ws),
                    )

            except websockets.exceptions.ConnectionClosed as e:
                logger.warning(f"WebSocket closed: {e}")
            except ConnectionRefusedError:
                logger.warning("Connection refused — server may be down")
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
            finally:
                self._connected = False
                self._ws = None

            # Exponential backoff
            logger.info(f"⏳ Reconnecting in {self._reconnect_delay}s...")
            await asyncio.sleep(self._reconnect_delay)
            self._reconnect_delay = min(self._reconnect_delay * 1.5, MAX_RECONNECT_DELAY)

    async def _heartbeat_loop(self, ws):
        """Send heartbeat every N seconds."""
        while True:
            try:
                await ws.send(json.dumps({"type": "heartbeat"}))
                logger.debug("💓 Heartbeat sent")
                await asyncio.sleep(HEARTBEAT_INTERVAL)
            except Exception:
                return  # Connection lost, let reconnect handle it

    async def _receive_loop(self, ws):
        """Listen for commands from server."""
        async for message in ws:
            try:
                data = json.loads(message)
                msg_type = data.get("type", "unknown")
                
                if msg_type == "heartbeat_ack":
                    logger.debug("💓 Heartbeat ACK")
                    continue

                logger.info(f"📨 Received: {msg_type}")
                await self.on_command(data)

            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from server: {message}")
            except Exception as e:
                logger.error(f"Error handling message: {e}")

    async def send(self, data: dict):
        """Send a message to the server."""
        if self._ws and self._connected:
            try:
                await self._ws.send(json.dumps(data))
                return True
            except Exception as e:
                logger.error(f"Send failed: {e}")
        return False

    async def send_door_closed(self, order_id: str):
        """Notify server that door was closed after dispensing."""
        return await self.send({
            "type": "door_closed",
            "order_id": order_id,
        })

    async def send_door_opened(self, order_id: str):
        """Notify server that door was opened."""
        return await self.send({
            "type": "door_opened",
            "order_id": order_id,
        })

    async def send_lock_confirmed(self, order_id: str):
        """Confirm that lock was opened successfully."""
        return await self.send({
            "type": "lock_confirmed",
            "order_id": order_id,
        })

    async def send_error(self, message: str):
        """Report an error to server."""
        return await self.send({
            "type": "error",
            "message": message,
        })
