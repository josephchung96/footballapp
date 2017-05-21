var Twit = require('twit');
var settings = require('./config');
var exports = {};

exports = new Twit(settings.Twitter);


module.exports = exports;