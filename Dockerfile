FROM v1ll4n/api-server-base-aes:latest

COPY build/index.html /var/www/html/index.html
COPY build/asset-manifest.json /var/www/html/asset-manifest.json
COPY build/static /var/www/html/static

# 复制环境变量模板文件
COPY build/env.template.js /var/www/html/env.template.js

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

# 覆盖默认的启动命令
ENTRYPOINT ["/entrypoint.sh"]
