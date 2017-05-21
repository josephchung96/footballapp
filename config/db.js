var mysql = require('mysql');
var settings = require('./config');
var exports = {};

exports.connectdb = function (callback) {

	var db = mysql.createConnection(settings.Database);

	db.connect(function(err){
		callback(err,db);
	});

};

module.exports = exports;