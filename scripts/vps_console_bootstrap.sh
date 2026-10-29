#!/bin/bash
# Paste into VPS provider web console (as root). Enables deploy from your PC without touching other sites.
set -e
mkdir -p ~/.ssh && chmod 700 ~/.ssh
KEY='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICCHgctsBPs9LxyNBTSFCx5AFhhY7ee2JWE125judcu8 administrator@DESKTOP-GMGJQ2V'
grep -qF "$KEY" ~/.ssh/authorized_keys 2>/dev/null || echo "$KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo "SSH key added. Run on your PC: npm run deploy:vps"
