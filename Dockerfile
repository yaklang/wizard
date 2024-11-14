FROM v1ll4n/api-server-base-aes:latest

COPY dist/index.html /var/www/html/index.html
COPY dist/asset-manifest.json /var/www/html/asset-manifest.json
COPY dist/static /var/www/html/static


COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

# 覆盖默认的启动命令
ENTRYPOINT ["/entrypoint.sh"]
