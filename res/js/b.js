var D = require('./d');
var b = function () {
	this.name = 'b';
	var d = new D();
	alert('b loaded');
};

module.exports = b;