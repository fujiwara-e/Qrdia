import socket
import os

class HostapdClient:
    def __init__(self, interface, socket_dir="/var/run/hostapd"):
        self.interface = interface
        self.socket_path = f"{socket_dir}/{interface}"
        self.local_socket_path = f"/tmp/hostapd_cli_{os.getpid()}"
        self.sock = None

    def send_command(self, cmd, timeout=5):
        if not os.path.exists(self.socket_path):
            raise FileNotFoundError(f"hostapd control socket not found: {self.socket_path}")
        try:
            os.unlink(self.local_socket_path)
        except FileNotFoundError:
            pass
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
        try:
            self.sock.bind(self.local_socket_path)
            self.sock.settimeout(timeout)
            self.sock.sendto(cmd.encode(), self.socket_path)
            response, _ = self.sock.recvfrom(4096)
            return response.decode(errors="replace")
        except socket.timeout:
            raise TimeoutError("Timeout waiting for response from hostapd")
        finally:
            self.sock.close()
            try:
                os.unlink(self.local_socket_path)
            except FileNotFoundError:
                pass
