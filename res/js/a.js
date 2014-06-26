// 加载依赖模块b
var B = require('./b');

var a = function () {
  var b = new B;
  document.body.innerHTML += "<br>a loaded";
};
// module.exports指定模块的输出
module.exports = a;