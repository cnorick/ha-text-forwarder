#!/bin/bash

pi=${1:-walnut}
SERVICE_NAME=ha-text-forwarder.service

echo "copying files to test machine (${pi})"
rsync -au * ${pi}:~/ha-text-forwarder
rsync .env ${pi}:~/ha-text-forwarder
rsync .nvmrc ${pi}:~/ha-text-forwarder
