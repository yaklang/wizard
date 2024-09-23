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

# 添加环境变量替换逻辑
echo "---------------------- START TO envsubst for env.template.js --------------------------"
envsubst < /var/www/html/env.template.js > /var/www/html/env.js
echo "envsubst for env.template.js FINISHED..."
echo "---------------------- /var/www/html/env.js --------------------------"
cat /var/www/html/env.js

nginx -g 'daemon off;'
