var connect = require('connect');
var http = require('http');
// node-cube 中间件模块
var cube_middleware = require('./lib/cube_middleware');

var app = connect()
  // node-cube 加载模块时带?m=1的query参数，需要用connect.query进行解析
  .use(connect.query())
  // 路由捕获
  .use('/routerPath', cube_middleware);

http.createServer(app).listen(3000);