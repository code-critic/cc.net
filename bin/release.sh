#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"


cd $DIR

python3 deploy.py

docker pull automatest/ubuntu-all
docker rm -f automatestWorker

killall cc.net
killall -9 cc.net