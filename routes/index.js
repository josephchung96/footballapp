var express = require('express');
var router = express.Router();
var dbcon = require('../config/db.js');
var client = require('../config/twitter.js');
var socket_io = require('socket.io');
var rdf = require('rdf')
var sparql = require('sparql')
var sparql_client = require('sparql-client')
var util = require('util')
var endpoint = 'http://dbpedia.org/spqrql'
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
    /*
    var chelseaScreenName = ['Radamel Falcao','Ruben Loftus Cheek','Stipe Perica',
                             'Branislav Ivanovic','Lucas Piazon','Mario Pasalic',
                             'Todd Kane','Matt Miazga','Joao Rodriguez',
                             'Charly Musonda Jr','John Terry','Marco Amelia',
                             'Oscar','Gary Cahill','Marco Van Ginkel',
                             'Lewis Baker','Matej Delac','Asmir Begovic',
                             'John Swift','Andreas Christensen','Baba Rahman',
                             'Bertrand Traore','Christian Atsu','Dom Solanke',
                             'Eden Hazard','Isaiah Brown','Jamal Blackman',
                             'Jeremie Boga','Michael Hector','Mitchell Beeney',
                             'Nathan','Nathan Ake','Nathaniel Chalobah','Papy Djilobodji',
                             'Patrick Bamford','Victorien Angban','Wallace Oliveira',
                             'Pato','Danilo Pantic','Juan Cuadrado','Tomas Kalas',
                             'Marko Marin','Cesc Fabregas Soler','Thibaut Courtois','Victor Moses',
                             'Diego Costa','Cristian Cuevas','Mikel John Obi','Pedro Rodriguez',
                             'Robery Kenedy','Nemanja Matic','Loic Remy','Cesar Azpilicueta',
                             'Kurt Zouma','Willian','Kenneth Omeruo']
    var manutdScreenName = ['Anthony Martial','Andreas Pereira','Luke Shaw','Marouane Fellaini','Ander Herrera',
                            'Daley Blind','Joe Riley','Borthwick Jackson','Chris Smalling','Joe Rothwell',
                            'Joel Castro Pereira','Marcos Rojo','Marcus Rashford','Phil Jones','Sam Johnstone',
                            'Timothy Fosu Mensah','Victor Valdes','Matteo Darmian','Tyler Blackett','Regan Poole',
                            'James Weir','Memphis Depay','Will Keane','Adnan Januzaj','Michael Carrick',
                            'Morgan Schneiderlin','David De Gea','James Wilson','Basti Schweinsteiger',
                            'Antonio Valencia','Sergio Romero','Guillermo Varela','Juan Mata Garcia','Nick Powell',
                            'Donald Love','Wayne Rooney','Ashley Young']
    var chelseaDbpedia = ['http://dbpedia.org/resource/Radamel_Falcao','http://dbpedia.org/resource/Ruben_Loftus-Cheek',
                          'http://dbpedia.org/resource/Stipe_Perica','http://dbpedia.org/resource/Branislav_Ivanovi%C4%87',
                          'http://dbpedia.org/resource/Lucas_Piazon','http://dbpedia.org/resource/Mario_Pa%C5%A1ali%C4%87','http://dbpedia.org/resource/Todd_Kane',
                          'http://dbpedia.org/resource/Matt_Miazga','http://dbpedia.org/resource/Joao_Rodr%C3%ADguez_(footballer)',
                          'http://dbpedia.org/resource/Charly_Musonda_(footballer,_born_1996)','http://dbpedia.org/resource/John_Terry',
                          'http://dbpedia.org/resource/Marco_Amelia','http://dbpedia.org/resource/Oscar_(footballer,_born_1991)',
                          'http://dbpedia.org/resource/Gary_Cahill','http://dbpedia.org/resource/Marco_van_Ginkel','http://dbpedia.org/resource/Lewis_Baker_(footballer)',
                          'http://dbpedia.org/resource/Matej_Dela%C4%8D','http://dbpedia.org/resource/Asmir_Begovi%C4%87'
                          'http://dbpedia.org/resource/John_Swift_(footballer,_born_1995)','http://dbpedia.org/resource/Andreas_Christensen',
                          'http://dbpedia.org/resource/Baba_Rahman','http://dbpedia.org/resource/Bertrand_Traor%C3%A9',
                          'http://dbpedia.org/resource/Christian_Atsu','http://dbpedia.org/resource/Dominic_Solanke',
                          'http://dbpedia.org/resource/Eden_Hazard','http://dbpedia.org/resource/Isaiah_Brown',
                          'http://dbpedia.org/resource/Jamal_Blackman','http://dbpedia.org/resource/J%C3%A9r%C3%A9mie_Boga',
                          'http://dbpedia.org/resource/Michael_Hector','http://dbpedia.org/resource/Mitchell_Beeney',
                          'http://dbpedia.org/resource/Nathan_(footballer,_born_1996)','http://dbpedia.org/resource/Nathan_Ak%C3%A9',
                          'http://dbpedia.org/resource/Nathaniel_Chalobah','http://dbpedia.org/resource/Papy_Djilobodji',
                          'http://dbpedia.org/resource/Patrick_Bamford','http://dbpedia.org/resource/Victorien_Angban',
                          'http://dbpedia.org/resource/Wallace_Oliveira','http://dbpedia.org/resource/Alexandre_Pato',
                          'http://dbpedia.org/resource/Danilo_Panti%C4%87','http://dbpedia.org/resource/Juan_Cuadrado',
                          'http://dbpedia.org/resource/Tom%C3%A1%C5%A1_Kalas','http://dbpedia.org/resource/Cesc_F%C3%A0bregas',
                          'http://dbpedia.org/resource/Thibaut_Courtois','http://dbpedia.org/resource/Victor_Moses',
                          'http://dbpedia.org/resource/Diego_Costa','http://dbpedia.org/resource/Cristi%C3%A1n_Cuevas',
                          'http://dbpedia.org/resource/John_Obi_Mikel','http://dbpedia.org/resource/Pedro_(footballer,_born_July_1987)',
                          'http://dbpedia.org/resource/Kenedy_(footballer)','http://dbpedia.org/resource/Nemanja_Mati%C4%87',
                          'http://dbpedia.org/resource/Lo%C3%AFc_R%C3%A9my','http://dbpedia.org/resource/C%C3%A9sar_Azpilicueta',
                          'http://dbpedia.org/resource/Kurt_Zouma','http://dbpedia.org/resource/Willian_(footballer)','http://dbpedia.org/resource/Kenneth_Omeruo']
    var manutdDbpedia =  ['http://dbpedia.org/resource/Anthony_Martial','http://dbpedia.org/resource/Andreas_Pereira','http://dbpedia.org/resource/Luke_Shaw',
                          'http://dbpedia.org/resource/Marouane_Fellaini','http://dbpedia.org/resource/Paddy_McNair','http://dbpedia.org/resource/Jesse_Lingard',
                          'http://dbpedia.org/resource/Ander_Herrera','http://dbpedia.org/resource/Daley_Blind','http://dbpedia.org/resource/Joe_Riley_(footballer,_born_1996)',
                          'http://dbpedia.org/resource/Cameron_Borthwick-Jackson','http://dbpedia.org/resource/Chris_Smalling','http://dbpedia.org/resource/Joe_Rothwell',
                          'http://dbpedia.org/resource/Joel_Castro_Pereira','http://dbpedia.org/resource/Marcos_Rojo','http://dbpedia.org/resource/Marcus_Rashford',
                          'http://dbpedia.org/resource/Phil_Jones_(footballer,_born_1992)','http://dbpedia.org/resource/Sam_Johnstone','http://dbpedia.org/resource/Timothy_Fosu-Mensah',
                          'http://dbpedia.org/resource/V%C3%ADctor_Vald%C3%A9s','http://dbpedia.org/resource/Matteo_Darmian','http://dbpedia.org/resource/Tyler_Blackett',
                          'http://dbpedia.org/resource/Regan_Poole','http://dbpedia.org/resource/James_Weir_(footballer)','http://dbpedia.org/resource/Memphis_Depay',
                          'http://dbpedia.org/resource/Will_Keane','http://dbpedia.org/resource/Adnan_Januzaj','http://dbpedia.org/resource/Michael_Carrick',
                          'http://dbpedia.org/resource/Morgan_Schneiderlin','http://dbpedia.org/resource/David_de_Gea','http://dbpedia.org/resource/James_Wilson_(footballer,_born_1995)',
                          'http://dbpedia.org/resource/Bastian_Schweinsteiger','http://dbpedia.org/resource/Antonio_Valencia','http://dbpedia.org/resource/Juan_Mata',
                          'http://dbpedia.org/resource/Nick_Powell','http://dbpedia.org/resource/Donald_Love',
                          'http://dbpedia.org/resource/Wayne_Rooney','http://dbpedia.org/resource/Ashley_Young']
    for (var i = 0; i <=  chelseaScreenName.length; i++)
        var key1 = SEARCHWORD.replace(/\s/g, '').toLowerCase();
        var key2 = chelseaScreenName[k].replace(/\s/g, '').toLowerCase();
        var key3 = manutdScreenName[k].replace(/\s/g, '').toLowerCase();
        if (key1 == key2)
          var query = 'SELECT ?name ?position ?dob FROM ' + chelseaDbpedia[k] + 'WHERE {dbp.name ?name;  dbo.position ?position; dbo.birthDate ?dob }';
        if (key1 == key3)
          var query = 'SELECT ?name ?position ?dob FROM ' + manutdDbpedia[k] + 'WHERE {dbp.name ?name;  dbo.position ?position; dbo.birthDate ?dob }';
        if (key1 != key2 && key1 != key3)
    var client = new SparqlClient(endpoint);
    client.query(query)
    */
    
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
