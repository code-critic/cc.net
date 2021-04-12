#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

workdir=$DIR

# cat << EOT > $DIR/cc.service
cat << EOT > /etc/systemd/system/cc.service
[Unit]
Description=Code Critic service
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=3
User=jan-hybs
WorkingDirectory=$workdir
ExecStart=/usr/bin/bash $DIR/cc.sh

[Install]
WantedBy=multi-user.target
EOT

systemctl stop cc
systemctl status cc
systemctl start cc