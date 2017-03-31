// module dependencies..
var express = require('express');
var router = express.Router();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Twit = require('twit');
var Promise = require("bluebird");
var http = require('http');
var client = new Twit({
  consumer_key: '5Sqzd11fpZ94Z33NtlXjU4b2W',
  consumer_secret: 'PFsR1I1gtU0vwADTunZPzkgteOobvSLmCZQYhgnups3weHOUJy',
  access_token: '1860715854-o7iTu0wVqd9jSyyS4rLNsmjq6CJSKd7xvwsnoBV',
  access_token_secret: '4fJYsMv2Xk59cxHzHjGaG7WOKLqyU4Earh6FNXlWI3Nyy'
});
var index = require('./routes/index');
var today = new Date();
var lastWeek = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false  }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.post('/postFile', function(req, res){

  var player = req.body.player;
  var team = req.body.team;
  var author = req.body.author;
  var tweetData = [];
  var lastWeekCount = new Array(7).fill(0);
  var lastWeekDates = new Array(7).fill(0);
  var search = {};
  var query = player+' '+team+' since:2011-11-11';
  var count = 10;
  
// REST API
  function searchLimit(query, count, totalCount){
    search.q = query;
    search.count = count;
    console.log(search)
    client.get('search/tweets', search ,
      function(err, data, response) {
        for (var indx in data.statuses) {
          var tweet= data.statuses[indx];
          var username= tweet.user.name;
          var screenName = tweet.user.screen_name;
          var tweetText = tweet.text;
          var dateTime = new Date(tweet.created_at).toLocaleString();
          var authorID = tweet.user.id_str;
          var tweetID = tweet.id_str;        
          var createdAt = new Date(tweet.created_at);
          
          tweetData.push([username, screenName, tweetText, dateTime, authorID, tweetID]);
          
          if (createdAt>lastWeek){
            lastWeekCount[createdAt.getDate()-lastWeek.getDate()] += 1;
          }
        };
        console.log(data.statuses.length)
        if (data.statuses.length==count) {
          search = {};
          search.max_id = data.statuses[ data.statuses.length - 1 ].id_str-1; 
          totalCount -= count;
          if (totalCount>0) {
            searchLimit(query, count, totalCount);
          }
        }
    });
  }
  
  searchLimit(query, count, 30);
  
  for (day=0;day<lastWeekCount.length;day++) {
    lastWeekDates[day] = lastWeek.getFullYear() + '-' + (lastWeek.getMonth()+1) + '-' + (lastWeek.getDate()+day);
  } 

// STREAMING API
    var stream = client.stream('statuses/filter', { track: player+' '+team })

    stream.on('tweet', function (tweet) {
      var username= tweet.user.name;
      var screenName = tweet.user.screen_name;
      var tweetText = tweet.text;
      var dateTime = new Date(tweet.created_at).toLocaleString();
      var authorID = tweet.user.id_str;
      var tweetID = tweet.id_str;        
      var createdAt = new Date(tweet.created_at);
          
      tweetData.push([username, screenName, tweetText, dateTime, authorID, tweetID]);
      
      if (createdAt>lastWeek){
        lastWeekCount[createdAt.getDate()-lastWeek.getDate()] += 1;
      }
    })
  app.set('tweetData',tweetData);
  app.set('lastWeekCount',lastWeekCount);
  app.set('lastWeekDates',lastWeekDates);
  res.send(req.body);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
