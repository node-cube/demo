/*!
 * nfmcg: middleware/script.js
 * Authors  : 剪巽 <jianxun.zxl@taobao.com> (https://github.com/fishbar)
 * Create   : 2014-05-23 21:31:08
 * CopyRight 2014 (c) Alibaba Group
 */
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
module.exports = function (req, res, next) {
  scriptProcessor(req, res, function () {
    console.log(' cube miss match, go to next >>>');
    staticProcessor(req, res, next);
  });
};