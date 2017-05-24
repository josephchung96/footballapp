/**
* Football gossip is a data mining tool which
* uses twiiter api. and dbpedia to achieve the goal.
*
* @author  Wyman Chung, Joseph Chung, Declan Hui
* @version 1.0
* @since   2017-05-24
*/

var config = {};

//mysql database confidential
config.Database = {
		host:		'stusql.dcs.shef.ac.uk',
		port: 		'3306',
		user: 		'team062',
		password:	'fa0ef08a',
		database:	'team062'
	};
	
//Twitter confidential
config.Twitter = {
		consumer_key:		'rt5aAKOB34jd4R7TGOplVN47M',
		consumer_secret:	'5wFI0iGMsNtkUh866jyfFkhUSde1luYYNlcMa2xEzq4WbPpTh0',
		access_token:		'3028228828-ubtmS4CIs6x67SjY1uzp6ffKm7wiQXp1iRUsuGv',
		access_token_secret:'MsqfWOYoGGstvOkU5uJmolGGSenqNX3mx8uSKUENyZHgJ'
	};

module.exports = config;