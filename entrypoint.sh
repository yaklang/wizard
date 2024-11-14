#!/bin/sh
set -e
export DOLLAR='$'

echo "START TO CONFIG HTTPS"
echo DISABLE_HTTPS: $DISABLE_HTTPS;
if [[ $DISABLE_HTTPS == true ]]; then
    echo '***DISABLE HTTPS***';
    export HTTPS_DISABLE_COMMENT='# ';
    echo '***HTTPS_DISABLE_COMMENT('$HTTPS_DISABLE_COMMENT')***';
else
    echo '***HTTPS CONFIG ENABLE***';
fi
echo "-------------------------------------------------"

env
echo
echo "---------------------- START TO envsubst --------------------------"
envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
echo "envsubst FINISHED..."
echo "---------------------- /etc/nginx/conf.d/default.conf --------------------------"
cat /etc/nginx/conf.d/default.conf


nginx -g 'daemon off;'
