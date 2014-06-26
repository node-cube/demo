var D = require('./d');
var b = function () {
	this.name = 'b';
	var d = new D();
  document.body.innerHTML += "<br>b loaded";
};

module.exports = b;