#!/bin/bash
set -e
cat > /etc/sudoers.d/deploy << 'ENDOFSUDOERS'
dev ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart syops
dev ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx
dev ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart quickdrop
dev ALL=(ALL) NOPASSWD: /usr/bin/nginx -t
ENDOFSUDOERS
chmod 440 /etc/sudoers.d/deploy
visudo -c -f /etc/sudoers.d/deploy
echo DONE
