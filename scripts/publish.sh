#!/bin/bash

pi=${1:-omada}

echo "copying files to test machine (${pi})"
rsync -au * ${pi}:~/ha-text-forwarder
scp .env ${pi}:~/ha-text-forwarder
scp .nvmrc ${pi}:~/ha-text-forwarder
