var express = require('express');
var router = express.Router();
var dbcon = require('../config/db.js');
var client = require('../config/twitter.js');
var socket_io = require('socket.io');
var SparqlClient = require('sparql-client');
var util = require('util');
var endpoint = 'http://dbpedia.org/sparql';
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
	var playerInfo;
	
	var io;
	if (!req.app.get('io')) {
		io = socket_io.listen(req.socket.server);
		req.app.set('io',io);
	} else {
		io = req.app.get('io');
	}
					
	var chelseaScreenName = ['@FALCAO',
							 '@rubey_lcheek',
							 'NIL',
							 'NIL',
							 '@LucasPiazon',
							 'NIL',
							 '@Toddy_Kane',
							 '@MattMiazga3',
							 'NIL',
							 '@CharlyMusondajr',
							 'NIL',
							 '@AmeliaGoalie',
							 '@oscar8',
							 '@GaryJCahill',
							 'NIL',
							 '@lew_baker',
							 '@MatejDelac',
							 '@asmir1',
							 '@JohnSwift8',
							 'NIL',
							 'NIL',
							 'NIL',
							 '@ChristianAtsu20',
							 '@DomSolanke',
							 '@hazardeden10',
							 '@izzyjaybrown',
							 '@Big_Blacks',
							 '@BogaJeremie',
							 '@Big_hec35',
							 '@mich_beeney1',
							 'NIL',
							 '@NathanAke',
							 '@chalobah',
							 '@papydjilo15 ',
							 '@Patrick_Bamford',
							 'NIL',
							 '@Wallace Oliveira',
							 '@AlexandrePato',
							 '@danilo_pantic',
							 '@Cuadrado',
							 '@KalasOfficial',
							 '@MM_MarkoMarin',
							 '@cesc4official',
							 '@thibautcourtois',
							 '@VictorMoses',
							 '@diegocosta',
							 'NIL',
							 '@mikel_john_obi',
							 '@_Pedro17_',
							 '@keenedy11',
							 'NIL',
							 '@LRemy18',
							 '@CesarAzpi',
							 '@KurtZouma',
							 '@willianborges88',
							 '@omeruo22']
						 
	var chelseaDbpedia = ['Radamel_Falcao',
						  'Ruben_Loftus-Cheek',
						  'Stipe_Perica',
						  'Branislav_Ivanovi%C4%87',
						  'Lucas_Piazon',
						  'Mario_Pa%C5%A1ali%C4%87',
						  'Todd_Kane',
						  'Matt_Miazga',
						  'Joao_Rodr%C3%ADguez_(footballer)',
						  'Charly_Musonda_(footballer,_born_1996)',
						  'John_Terry',
						  'Marco_Amelia',
						  'Oscar_(footballer,_born_1991)',
						  'Gary_Cahill',
						  'Marco_van_Ginkel',
						  'Lewis_Baker_(footballer)',
						  'Matej_Dela%C4%8D',
						  'Asmir_Begovi%C4%87',
						  'John_Swift_(footballer,_born_1995)',
						  'Andreas_Christensen',
						  'Baba_Rahman',
						  'Bertrand_Traor%C3%A9',
						  'Christian_Atsu',
						  'Dominic_Solanke',
						  'Eden_Hazard',
						  'Isaiah_Brown',
						  'Jamal_Blackman',
						  'J%C3%A9r%C3%A9mie_Boga',
						  'Michael_Hector',
						  'Mitchell_Beeney',
						  'Nathan_(footballer,_born_1996)',
						  'Nathan_Ak%C3%A9',
						  'Nathaniel_Chalobah',
						  'Papy_Djilobodji',
						  'Patrick_Bamford',
						  'Victorien_Angban',
						  'Wallace_Oliveira',
						  'Alexandre_Pato',
						  'Danilo_Panti%C4%87',
						  'Juan_Cuadrado',
						  'Tom%C3%A1%C5%A1_Kalas',
						  'Marko_Marin',
						  'Cesc_F%C3%A0bregas',
						  'Thibaut_Courtois',
						  'Victor_Moses',
						  'Diego_Costa',
						  'Cristi%C3%A1n_Cuevas',
						  'John_Obi_Mikel',
						  'Pedro_(footballer,_born_July_1987)',
						  'Kenedy_(footballer)',
						  'Nemanja_Mati%C4%87',
						  'Lo%C3%AFc_R%C3%A9my',
						  'C%C3%A9sar_Azpilicueta',
						  'Kurt_Zouma',
						  'Willian_(footballer)',
						  'Kenneth_Omeruo']
						  
	var manutdScreenName = ['@AnthonyMartial',
                            '@andrinhopereira',
                            '@LukeShaw23',
                            '@Fellaini',
                            '@PadMcnair',
                            '@JesseLingard',
                            '@AnderHerrera',
                            '@BlindDaley',
                            '@joeriley49',
                            '@DareToBorthwick',
                            '@ChrisSmalling',
                            'NIL',
                            '@ElgatoPereira1',
                            'NIL',
                            '@MarcusRashford',
                            '@PhilJones',
                            '@samjohnstone50',
                            '@tfosumensah',
                            '@1victorvaldes',
                            '@DarmianOfficial',
                            '@TylerNBlackett',
                            '@ReganPoole',
                            '@Jamesweir47',
                            '@Memphis_Depay',
                            'NIL',
                            '@adnanjanuzaj',
                            '@carras16',
                            '@schneiderlinmo4',
                            '@D_DeGea',
                            'NIL',
                            '@BSchweinsteiger',
                            '@anto_v25 ',
                            'NIL',
                            '@guille_varela4',
                            '@juanmata8',
                            '@NPowell25',
                            'NIL',
                            '@WayneRooney',
                            '@youngy18']
							
	var manutdDbpedia =  ['Anthony_Martial',
						  'Andreas_Pereira',
						  'Luke_Shaw',
						  'Marouane_Fellaini',
						  'Paddy_McNair',
						  'Jesse_Lingard',
						  'Ander_Herrera',
						  'Daley_Blind',
						  'Joe_Riley_(footballer,_born_1996)',
						  'Cameron_Borthwick-Jackson',
						  'Chris_Smalling',
						  'Joe_Rothwell',
						  'Joel_Castro_Pereira',
						  'Marcos_Rojo',
						  'Marcus_Rashford',
						  'Phil_Jones_(footballer,_born_1992)',
						  'Sam_Johnstone',
						  'Timothy_Fosu-Mensah',
						  'V%C3%ADctor_Vald%C3%A9s',
						  'Matteo_Darmian',
						  'Tyler_Blackett',
						  'Regan_Poole',
						  'James_Weir_(footballer)',
						  'Memphis_Depay',
						  'Will_Keane',
						  'Adnan_Januzaj',
						  'Michael_Carrick',
						  'Morgan_Schneiderlin',
						  'David_de_Gea',
						  'James_Wilson_(footballer,_born_1995)',
						  'Bastian_Schweinsteiger',
						  'Antonio_Valencia',
						  'Sergio_Romero',
						  'Guillermo_Varela',
						  'Juan_Mata',
						  'Nick_Powell',
						  'Donald_Love',
						  'Wayne_Rooney',
						  'Ashley_Young']
 
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
						io.emit('restAPI', { message: 'done', tweets: tweetData, lwDate: lastWeekDates, lwCount: lastWeekCount, playerInfo:playerInfo });
					}
				} else {
					setTimeout(function() {
						io.emit('restAPI', { message: 'done', tweets: tweetData, lwDate: lastWeekDates, lwCount: lastWeekCount, playerInfo:playerInfo });
					}, 500);
				}
			}
		});
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

//dbpedia query
	function searchdbpedia(){
		
		if (player) {
				
			var isChelsea=false;
			var isManutd=false;
			var dbpedia;
			
			for (member in chelseaScreenName) {
				var chelseaPlayer = chelseaScreenName[member];
				if (player.toLowerCase()==chelseaPlayer.toLowerCase() && chelseaPlayer!='NIL' && player!='NIL') {
					isChelsea=true;
					dbpedia=chelseaDbpedia[member];
				}
			}
			
			for (member in manutdScreenName) {
				var manutdPlayer = manutdScreenName[member];
				if (player.toLowerCase()==manutdPlayer.toLowerCase() && manutdPlayer!='NIL' && player!='NIL') {
					isManutd=true;
					dbpedia=manutdDbpedia[member];
				}
			}
			
			if (isChelsea || isManutd) {
				
				var q = "PREFIX  dbo:  <http://dbpedia.org/ontology/>"+
						"PREFIX  rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+
						"PREFIX  dbp:  <http://dbpedia.org/property/>"+
						"PREFIX  dbr:  <http://dbpedia.org/resource/>"+

						"SELECT ?name ?position ?birthDate ?team "+
						"WHERE"+
						"  { dbr:"+dbpedia+
						"              rdfs:label       ?name ;"+
						"              dbo:birthDate    ?birthDate;"+
						"              dbo:position     ?x;"+
						"              dbp:currentclub  ?y."+
						"   ?x         rdfs:label       ?position."+
						"   ?y         rdfs:label       ?team."+

						'    FILTER langMatches(lang(?name), "EN")'+
						'    FILTER langMatches(lang(?position), "EN")'+
						'    FILTER langMatches(lang(?team), "EN")'+
						"  }"
				 
				var sparql = new SparqlClient(endpoint);
				
				client.get('users/show', {screen_name: player.substring(1)} , function(err, data, response) {
					var photoURL;
					if (data.profile_image_url) {
						photoURL = data.profile_image_url.replace("_normal","");
					}
					sparql.query(q).execute(function(error, results) {
						if (!error) {
							var data = results.results.bindings[0];
							playerInfo = {
								name : data.name.value,
								pos	 : data.position.value,
								dob	 : data.birthDate.value,
								team : data.team.value,
								photo: photoURL
							};
							req.app.set('playerInfo', playerInfo);
						}
					});
				});
			} else {
				req.app.set('playerInfo', '');
			}
		}
	}
	
//search

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

	dbcon.connectdb(function(dbErr, connection){

		if (database) {
			if (currentStream) {
				currentStream.stop();
			}
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
				searchdbpedia();
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
						io.emit('dbOnly', { message: 'done', tweets: tweetData, lwDate: lastWeekDates, lwCount: lastWeekCount, playerInfo: playerInfo });
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
			searchdbpedia();
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
	req.app.set('tweetData', tweetData);
	req.app.set('lastWeekCount', lastWeekCount);
	req.app.set('lastWeekDates', lastWeekDates);
	res.send(req.body);	
});

router.get('/results', function(req, res, next) {
	var tweetData = req.app.get('tweetData');
	var lastWeekCount = req.app.get('lastWeekCount');
	var lastWeekDates = req.app.get('lastWeekDates');
	var playerInfo = req.app.get('playerInfo');
	
	if (tweetData==null) {
		res.render('results', { title: 'Football Gossip Application' });
	}else{
		res.render('results', { 
			title: 'Football Gossip Application', 
			data : {
				'tData' : tweetData, 
				'lwCount' : lastWeekCount, 
				'lwDate' : lastWeekDates, 
				'playerInfo' : playerInfo
			}
		});
	}
});

module.exports = router;
