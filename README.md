node-cube.js 使用示例
=============

一、示例的启动
---------

1. 在项目根目录下运行 npm install 安装依赖包

2. 在项目根目录下运行 node app.js 启动应用

3. 浏览器访问 http://localhost:3000/routerPath/

二、项目部署
----------

1.后端路由捕获 (app.js)
```js
var connect = require('connect');
var http = require('http');
var cube_middleware = require('./lib/cube_middleware'); // node-cube 中间件模块

var app = connect()
  .use('/routerPath', cube_middleware);  // 路由捕获

http.createServer(app).listen(3000);
```

2、中间件模块 (lib/node_middleware.js)
```js
var cube = require('node-cube'); // 载入node-cube模块
var Path = require('path');

//设置静态资源文件夹路径
var assetsDir = Path.join(__dirname, '../res');
//初始化node-cube脚本处理模块
var scriptProcessor = cube.init({
  middleware: true,
  root: assetsDir
});

// 中间件处理流程：
// scriptProcessor 会对带?m=1查询参数的资源访问进行捕获, 对相应的资源进行依赖关系的处理后，传送给前端。
// 对不带?m=1查询参数的资源，scriptProcessor直接返回静态资源。
module.exports = scriptProcessor;
```

3、模块格式 （res/a.js）格式类似于后端的node模块
```js
// 加载依赖模块b
var B = require('./b');

var a = function () {
  var b = new B;
  alert('a loaded');
};
// module.exports指定模块的输出
module.exports = a;
```

4、前端部署
```html
<!-- 加载cube.js前端模块，此脚本负责模块请求的封装和依赖关系的解析 -->
<script src="/routerPath/js/cube.js" type="text/javascript"></script>
<script>
// cube.js 的初始化和请求发起
;(function () {
	var base = '/routerPath'; // 静态资源路由
	// 此示例需要加载没有依赖关系的a.js和c.js两个模块
	var appConfig = [{
	  app: '/js/a.js'
	}, {
	  app: '/js/c.js'
	}];
	//Cube.init 初始化 node-cube
	Cube.init({
	  base: base, //静态资源路由
	  charset: 'utf-8'
	});
	//Cube.use加载后端模块
	appConfig.forEach(function (d) {
		Cube.use(d.app, function (App) {
		   //App 即为各模块的module.exports
		   new App();
		});
	});
})();
</script>
```

三、请求过程解析
-----------

1、html

发起http://localhost:3000/routerPath 请求后，因为匹配/routerPath路由， 会由cube-middleware模块处理，又因为没有?m=1查询参数，所以就直接返回静态资源
res/index.html

2、/routerPath/js/cube.js

因为匹配/routerPath路由， 会由cube-middleware模块处理，又因为没有?m=1查询参数，所以就直接返回静态资源
res/js/cube.js

3、cube.use请求
在此请求中，a依赖b模块，b依赖d模块。d模块和c模块不依赖其他模块


对c.js的请求url为/routerPath/js/c.js?m=1&1403661393821，其中有?m=1查询参数以及防止浏览器缓存的随机数。cube-middleware中间件捕获并进行了相应的处理。c.js返回的实际内容如下。它的依赖数组[]为空,载入完成后直接的调用cube.use的callback: function (App) { new App(); }
```js
Cube("/js/c.js", [], function (module, exports, require, async, __dirname, __filename) {
var c = function () {
	this.name = 'c';
	alert('c loaded');
};
module.exports= c;
return module.exports;});
```


对a.js的请求url为/routerPath/js/a.js?m=1&1403661393821，其中有?m=1查询参数以及防止浏览器缓存的随机数。cube-middleware中间件捕获并进行了相应的处理。a.js返回的实际内容如下。

```js
Cube("/js/a.js", ["/js/b.js"], function (module, exports, require, async, __dirname, __filename) {
// 加载依赖模块b
var B = require('/js/b.js');

var a = function () {
  var b = new B;
  alert('a loaded');
};
// module.exports指定模块的输出
module.exports = a;

return module.exports;});
```

主要是加载了新的头和尾。前端cube.js会解析依赖信息["/js/b.js"]（只有a的直接依赖模块b，没有b的依赖模块d），发起新的请求 /routerPath/js/b.js?m=1&1403661393821

b.js的实际请求内容：
```js
Cube("/js/b.js", ["/js/d.js"], function (module, exports, require, async, __dirname, __filename) {
var D = require('/js/d.js');
var b = function () {
	this.name = 'b';
	var d = new D();
	alert('b loaded');
};

module.exports = b;
return module.exports;});
```

b.js解析后又会发起新的请求 /routerPath/js/d.js?m=1&1403661393821

d.js的实际请求内容：
```js
Cube("/js/d.js", [], function (module, exports, require, async, __dirname, __filename) {
var d = function () {
	this.name = 'd';
	alert('d loaded');
};

module.exports = d;
return module.exports;});
```

此时没有新的依赖模块要加载，就会调用cube.use的callback
```js
		Cube.use(d.app, function (App) {
		   //App 即为各模块的module.exports
		   new App();
		});
```
至此所有依赖都加载完。


四、路径解释
-----------

本示例中，一共有两个路径需要注意，前端路由路径 '/routerPath' 和 后端静态文件夹路径 '../res'。

前端路由路径（'/routerPath'）出现在了这几个地方：

  (1) html 的浏览器访问url

  (2) cube.js 载入时的 src 路径 (index.html)

  (3) cube 模块初始化时的 base 路径 (index.html)

  (4) 后端路由解析路径 (app.js)

这些地方的路由路径可以任意指定（如为'/'），但必须一致。

后端静态文件夹路径 '../res' 只出现在了lib/cube_middleware.js 中，这是由后端静态资源相对于cube_middleware.js的实际存储路径决定的。



五、 cube_middleware.js 的 honeycomb兼容。
-----------

honeycomb要进行一层middleware的兼容,如下所示
```js
var cube = require('node-cube'); // 载入node-cube模块
var Path = require('path');
var connect = require('connect');

//设置静态资源文件夹路径
var assetsDir = Path.join(__dirname, '../res');
//初始化node-cube脚本处理模块
var scriptProcessor = cube.init({
  middleware: true,
  root: assetsDir
});
//初始化静态资源读取模块
var staticProcessor = connect.static(assetsDir);
// 中间件处理流程：
// scriptProcessor 会对带?m=1查询参数的资源访问进行捕获, 对相应的资源进行依赖关系的处理后，传送给前端。
// 对不带?m=1查询参数的资源，scriptProcessor不捕获，此处则是由staticProcessor直接返回静态资源。

module.exports = function () {
  return { // honeycomb兼容
    middleware: function () { // honeycomb兼容
      return function (req, res, next) {
        scriptProcessor(req, res, function () {
          console.log(' cube miss match, go to next >>>');
          staticProcessor(req, res, next);
        });
      }
    } // honeycomb兼容
  }; // honeycomb兼容
};
```




