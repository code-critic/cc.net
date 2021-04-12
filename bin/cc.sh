#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
logfile=$DIR/service.log

cd $DIR
echo $(date --rfc-3339=seconds) >> $logfile

docker pull automatest/ubuntu-all
git pull