const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    proxy({
      target: "http://192.168.3.3:8082",
      // target: 'http://localhost:8082',
      // target: "http://192.168.3.100:8082",
      // target: "http://legion-4g.yaklang.com:8080/",
      changeOrigin: true,
    })
  );
  app.use(
    "/static/images",
    proxy({
      target: "http://localhost:8082",
      changeOrigin: true,
    })
  );
  app.use(
    "/static/img",
    proxy({
      target: "http://localhost:8082",
      changeOrigin: true,
    })
  );
};
