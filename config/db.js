/**
* Football gossip is a data mining tool which
* uses twiiter api. and dbpedia to achieve the goal.
*
* @author  Wyman Chung, Joseph Chung, Declan Hui
* @version 1.0
* @since   2017-05-24
*/

var mysql = require('mysql');
var settings = require('./config');
var exports = {};

//mysql database callback function
exports.connectdb = function (callback) {

	var db = mysql.createConnection(settings.Database);

	db.connect(function(err){
		callback(err,db);
	});

};

module.exports = exports;