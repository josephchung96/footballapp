var express = require('express');
var router = express.Router();
var dbcon = require('../config/db.js');
var client = require('../config/twitter.js');
var socket_io = require('socket.io');
var currentStream;

/* GET home page. */
router.get('/', function(req, res, next) {
	if (!Object.keys(req.query).length) {
		res.render('index', { title: 'Football Gossip Application' });
	} else {
		res.render('index', { title: 'Football Gossip Application', data : {'query' : req.query} });
	}
});

router.post('/postFile', function(req, res){
	var today = new Date();
	var lastWeek = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
	var lastWeekCount = new Array(7).fill(0);
	var lastWeekDates = new Array(7).fill(0);
	
	var player = req.body.player;
	var team = req.body.team;
	var author = req.body.author;
	var playerToTeam = req.body.playerToTeam;
	var teamToAuthor = req.body.teamToAuthor;
	var authorToPlayer = req.body.authorToPlayer;
	var database = req.body.database;
	
	var query;
	var tracks;
	
	var search = {};
	var count = 100;
	var totalCount = 300;
	
	var tweetData = [];
	
	var io;
	if (!req.app.get('io')) {
		io = socket_io.listen(req.socket.server);
		req.app.set('io',io);
	} else {
		io = req.app.get('io');
	}
 
//initialize last week dates
	for (day=0;day<lastWeekCount.length;day++) {
		lastWeekDates[day] = lastWeek.getFullYear() + '-' + (lastWeek.getMonth()+1) + '-' + (lastWeek.getDate()+day);
	} 
	
//64bit int subtraction work around
	function decStrNum (n) {
		n = n.toString();
		var result=n;
		var i=n.length-1;
		while (i>-1) {
			if (n[i]==='0') {
				result=result.substring(0,i)+'9'+result.substring(i+1);
				i --;
			}
			else {
				result=result.substring(0,i)+(parseInt(n[i],10)-1).toString()+result.substring(i+1);
				return result;
			}
		}
		return result;
	}
	
//recursive searching
	function searchTweets(query, count, totalCount, connection, dbErr){
		search.q = query;
		search.count = count;
		client.get('search/tweets', search ,function(err, data, response) {
			if (data) {
				for (var indx in data.statuses) {
					var tweet= data.statuses[indx];
					var username= tweet.user.name;
					var screenName = tweet.user.screen_name;
					var tweetText = tweet.text;
					var authorID = tweet.user.id_str;
					var tweetID = tweet.id_str;				
					var createdAt = new Date(tweet.created_at);
					
					tweetData.push([username, screenName, tweetText, createdAt.toLocaleString(), authorID, tweetID]);
					
					if (createdAt>lastWeek){
						lastWeekCount[createdAt.getDate()-lastWeek.getDate()] += 1;
					}
					
					var record = { 
						username: username,
						screenname: screenName,
						content: tweetText,
						date: createdAt.toLocaleString(),
						authorID: authorID,
						tweetID: tweetID,
					}
					if (!dbErr) {
						connection.query('INSERT INTO Tweet SET ? ON DUPLICATE KEY UPDATE date = VALUES(date)', record, function(err,res){
							if(err) throw err;
						});
					}
				};

				if (data.statuses.length==count) {
					search = {};
					search.max_id = decStrNum(data.statuses[ data.statuses.length - 1 ].id_str); 
					totalCount -= count;
					if (totalCount>0) {
						searchTweets(query, count, totalCount, connection, dbErr);
					}else{
						io.emit('restAPI', { message: 'done', tweets: tweetData});
					}
				} else {
					setTimeout(function() {
						io.emit('restAPI', { message: 'done', tweets: tweetData });
					}, 500);
				}
			}
		});
	}

//query combination guards
	if (playerToTeam=='or') {
		query = player + ' OR ' + team;
	} else if (!player) {
		query = team;
	} else if (!team) {
		query = player;
	} else {
		query = player + ' ' + team
	}
	
	tracks = query;
	
	if (author) {
			
		if (author==player && author!=team) {
			query = query + ' -from:'+ player;
		}
		
		if (author!=player && author==team) {
			query = query + ' -from:'+ team;
		}
		
		if (teamToAuthor=='and' || authorToPlayer=='and') {
			query =	query + ' from:'+ author;
		} else if (player || team) {
			query = query + ' OR from:'+ author;
		} else {
			query = 'from:'+ author;
		}
		
	} else {
		if (player && team) {
			query = query + ' -from:' + player + ' -from:' + team;
		} else if (!team) {
			query = query + ' -from:' + player;
		} else if (!player) {
			query = query + ' -from:' + team;
		}
	}	

//twitter streaming into db
	function streamTweets(stream, connection, dbErr) {
		stream.on('tweet', function (tweet) {
			var username= tweet.user.name;
			var screenName = tweet.user.screen_name;
			var tweetText = tweet.text;
			var createdAt = new Date(tweet.created_at);
			var authorID = tweet.user.id_str;
			var tweetID = tweet.id_str;				
			
			var valid = true;
			
			var io = req.app.get('io');
			
			// AND author
			if ((teamToAuthor=='and' || authorToPlayer=='and')) {
				if (screenName!=author.substring(1)) {
				valid = false;
				}
			}

			if (valid) {
				tweetData.push([username, screenName, tweetText, createdAt.toLocaleString(), authorID, tweetID]);
			
				if (createdAt>lastWeek){
					lastWeekCount[createdAt.getDate()-lastWeek.getDate()] += 1;
				}

				var record = {
					username: username,
					screenname: screenName,
					content: tweetText,
					date: createdAt.toLocaleString(),
					authorID: authorID,
					tweetID: tweetID,
				}
				io.emit('tweet', { tweet: record });
				if (!dbErr) {
					connection.query('INSERT INTO Tweet SET ? ON DUPLICATE KEY UPDATE date = VALUES(date)', record, function(err,res){
						if(err) throw err;
					});
				}
			}
		});
	}
	
//search
	dbcon.connectdb(function(dbErr, connection){

		if (database) {
			
			var sqlQuery = 'SELECT * FROM Tweet ';
			
			if (player) {
				sqlQuery = sqlQuery + "WHERE (content LIKE '%"+player+"%'";
				if (team) {
					sqlQuery = sqlQuery + " " + playerToTeam + " content LIKE '%"+team+"%'";
					if (author) {
						sqlQuery = sqlQuery + " " + teamToAuthor + " screenName LIKE '%"+author.substring(1)+"%'";
					}
				} else if (author) {
					sqlQuery = sqlQuery + " " + authorToPlayer + " screenName LIKE '%"+author.substring(1)+"%'";
				}
			} else if (team) {
				sqlQuery = sqlQuery + "WHERE (content LIKE '%"+team+"%'";
				if (author) {
					sqlQuery = sqlQuery + " " + teamToAuthor + " screenName LIKE '%"+author.substring(1)+"%'";
				}
			} else  if (author) {
				sqlQuery = sqlQuery + "WHERE (screenName LIKE '%"+author.substring(1)+"%'";
			}
			
			sqlQuery = sqlQuery+")";
			
			if (!dbErr) {
				connection.query(sqlQuery, function(err,res){
					if(err) throw err;
					for (tweet in res) {
						tweetData.push([
								res[tweet].username, 
								res[tweet].screenname, 
								res[tweet].content, 
								res[tweet].date.toLocaleString(), 
								res[tweet].authorID, 
								res[tweet].tweetID
						]);
						
						if (res[tweet].date>lastWeek){
							lastWeekCount[res[tweet].date.getDate()-lastWeek.getDate()] += 1;
						}
					}
					setTimeout(function() {
						io.emit('dbOnly', { message: 'done' , tweets: tweetData});
					}, 500);
				});
			} else {
				io.emit('dbOnly', { message: 'error' });
			}
		} else {
			
		// REST API
			if (!dbErr){
				setTimeout(function() {
					io.emit('restAPI', { message: 'dbSuccess' });
				}, 500);
			} else {
				io.emit('restAPI', { message: 'dbError' });
			}

			searchTweets(query, count, totalCount, connection, dbErr);

		// STREAMING API
			var userID;
			var stream;
			
			if (author) {
				client.get('users/show', {screen_name: author.substring(1)} , function(err, data, response) {
					if (data.id) {
						userID = data.id;
					}
					if (currentStream) {
						currentStream.stop();
					}
					stream = client.stream('statuses/filter', { track: tracks, follow: userID });
					currentStream = stream;
					streamTweets(stream, connection, dbErr);
				});
				
			} else {
				if (currentStream) {
					currentStream.stop();
				}
				stream = client.stream('statuses/filter', { track: tracks });
				currentStream = stream;
				streamTweets(stream, connection, dbErr);
			}

			
		}
    });
	
// passing variables to route
	req.app.set('tweetData',tweetData);
	req.app.set('lastWeekCount',lastWeekCount);
	req.app.set('lastWeekDates',lastWeekDates);
	res.send(req.body);	
});

router.get('/results', function(req, res, next) {
	var tweetData = req.app.get('tweetData');
	var lastWeekCount = req.app.get('lastWeekCount');
	var lastWeekDates = req.app.get('lastWeekDates');
	if (tweetData==null) {
		res.render('results', { title: 'Football Gossip Application' });
	}else{
		res.render('results', { title: 'Football Gossip Application', data : {'tData' : tweetData, 'lwCount' : lastWeekCount, 'lwDate' : lastWeekDates}});
	}
});

module.exports = router;
