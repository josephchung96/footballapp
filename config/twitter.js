/**
* Football gossip is a data mining tool which
* uses twiiter api. and dbpedia to achieve the goal.
*
* @author  Wyman Chung, Joseph Chung, Declan Hui
* @version 1.0
* @since   2017-05-24
*/

var Twit = require('twit');
var settings = require('./config');
var exports = {};

exports = new Twit(settings.Twitter);


module.exports = exports;