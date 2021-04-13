#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
logfile=$DIR/service.log


cd $DIR
echo "------------------------------------------- cc.service" >> $logfile

echo $(date --rfc-3339=seconds) "Updating docker file" >> $logfile
docker pull automatest/ubuntu-all >> $logfile 2>&1


echo $(date --rfc-3339=seconds) "Updating repository" >> $logfile
git pull >> $logfile 2>&1


echo $(date --rfc-3339=seconds) "Deploying" >> $logfile
python3 deploy.py >> $logfile


echo $(date --rfc-3339=seconds) "Killing previous version" >> $logfile
killall cc.net
killall -9 cc.net


echo $(date --rfc-3339=seconds) "Starting new version" >> $logfile
cc.latest