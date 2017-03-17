var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Twit = require('twit');
var client = new Twit({
  consumer_key: '5Sqzd11fpZ94Z33NtlXjU4b2W',
  consumer_secret: 'PFsR1I1gtU0vwADTunZPzkgteOobvSLmCZQYhgnups3weHOUJy',
  access_token: '1860715854-o7iTu0wVqd9jSyyS4rLNsmjq6CJSKd7xvwsnoBV',
  access_token_secret: '4fJYsMv2Xk59cxHzHjGaG7WOKLqyU4Earh6FNXlWI3Nyy'
});

var index = require('./routes/index');
var users = require('./routes/users');

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
app.use('/users', users);
app.post('/postFile', function(req, res){
  //console.log(JSON.stringify(req.body));
  var player = req.body.player;
  var team = req.body.team;
  var author = req.body.author;
  
  client.get('search/tweets', { q: player+' '+team+' since:2011-11-11', count: 10 },
  function(err, data, response) {
    for (var indx in data.statuses) {
    var tweet= data.statuses[indx];
    console.log('on: ' + tweet.created_at + ' : @' + tweet.user.screen_name + ' : ' + tweet.text+'\n\n');
    }
  });
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
