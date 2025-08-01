# dpp_hostapd_py

A Python tool to send commands to hostapd via UNIX domain socket and receive responses.

## Usage

```
python main.py <interface> <command>
```

Example:
```
python main.py wlan0 DPP_BOOTSTRAP_GEN type=qrcode
```

## Notes
- hostapd must be running with the control interface enabled.
- Root privileges may be required.
