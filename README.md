# Vending Pi

Raspberry Pi service for Marketa smart vending machine.

## Structure

```
pi-service/       # GPIO controller + WebSocket client
kiosk-ui/         # Touch screen UI (React/Vite)
```

## Pi Setup

- Raspberry Pi with 11" touchscreen (1920x1080)
- GPIO17 = electric lock relay
- GPIO27 = door sensor (optional)
- Connects to backend via Tailscale WebSocket

## Deploy

Files live at `/home/rpi/vending-machine/` on the Pi.
