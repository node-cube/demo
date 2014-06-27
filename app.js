var connect = require('connect');
var http = require('http');
var cube_middleware = require('./lib/cube_middleware'); // node-cube 中间件模块

var app = connect()
  .use('/routerPath', cube_middleware);  // 路由捕获

http.createServer(app).listen(3000);