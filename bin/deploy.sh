#!/bin/bash

CCURL=https://github.com/code-critic/cc.net/archive/refs/heads/master.zip
CWD=/home/jan-hybs/projects/cc/publish
rm -rf master.zip

cd $CWD
wget $CCURL
unzip master.zip
