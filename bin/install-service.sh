#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

workdir=$DIR

# cat << EOT > $DIR/cc.service
# Restart=always
# RestartSec=3
# ExecStart=/home/jan-hybs/projects/cc/publish/1.1.0/www/cc.net --urls http://0.0.0.0:5000
# WorkingDirectory=/home/jan-hybs/projects/cc/publish/1.1.0/www
cat << EOT > /etc/systemd/system/cc.service
[Unit]
Description=Code Critic service
StartLimitIntervalSec=0

[Service]
Type=simple
User=jan-hybs
Restart=always
RestartSec=3
ExecStart=/home/jan-hybs/.local/bin/cc.latest --prod --urls http://0.0.0.0:5000

[Install]
WantedBy=multi-user.target
EOT

systemctl daemon-reload
systemctl stop cc
systemctl status cc
systemctl start cc