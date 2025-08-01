import sys
from .hostapd_client import HostapdClient

def main():
    import argparse
    parser = argparse.ArgumentParser(description="hostapd制御ソケットにコマンドを送信する最小ツール")
    parser.add_argument("interface", help="hostapdインターフェース名 (例: wlan0)")
    parser.add_argument("command", help="hostapdに送るコマンド文字列 (例: DPP_BOOTSTRAP_GEN type=qrcode)", nargs=argparse.REMAINDER)
    args = parser.parse_args()

    # conf_json=... の値をシングルクォートで囲む
    command_args = []
    for arg in args.command:
        if arg.startswith("conf_json=") and not arg.startswith("conf_json='"):
            key, val = arg.split("=", 1)
            if not (val.startswith("'") and val.endswith("'")):
                val = f"'{val}'"
            command_args.append(f"{key}={val}")
        else:
            command_args.append(arg)
    command_str = " ".join(command_args)

    client = HostapdClient(args.interface)
    try:
        response = client.send_command(command_str)
        print(response)
    except Exception as e:
        print(f"エラー: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
