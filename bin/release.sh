#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

set -x
cd $DIR

python3 deploy.py

docker pull automatest/ubuntu-all:22.04
docker rm -f automatestWorker

killall cc.latest
killall -9 cc.latest