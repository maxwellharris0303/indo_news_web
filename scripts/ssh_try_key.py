from pathlib import Path
import paramiko

key_path = Path(__file__).with_name("deploy_ed25519")
pkey = paramiko.Ed25519Key.from_private_key_file(str(key_path))
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("23.88.20.96", username="root", pkey=pkey, timeout=30, allow_agent=False, look_for_keys=False)
stdin, stdout, stderr = c.exec_command("hostname; ls /etc/nginx/sites-enabled 2>/dev/null; ss -tlnp | head -20")
print(stdout.read().decode())
print(stderr.read().decode())
c.close()
print("KEY OK")
