var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Football Gossip Application' });
});
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Football Gossip Application' });
});
router.get('/trends', function(req, res, next){
  var lastWeekCount = req.app.get('lastWeekCount');
  var lastWeekDates = req.app.get('lastWeekDates');
  if (lastWeekCount==null || lastWeekDates==null) {
    res.render('trends', { title: 'Trends' });
  }else{
    res.render('trends', { title: 'Trends', data : {'lwCount' : lastWeekCount, 'lwDate' : lastWeekDates}});
  }
});
router.get('/output', function(req, res, next) {
  var tweetData = req.app.get('tweetData');
  if (tweetData==null) {
    res.render('output', { title: 'Output' });
  }else{
    res.render('output', { title: 'Output', data : {'tData' : tweetData}});
  }
});
router.get('/test', function(req, res, next) {
	var Twit = require('twit');
	var client = new Twit({
	  consumer_key: '5Sqzd11fpZ94Z33NtlXjU4b2W',
	  consumer_secret: 'PFsR1I1gtU0vwADTunZPzkgteOobvSLmCZQYhgnups3weHOUJy',
	  access_token: '1860715854-o7iTu0wVqd9jSyyS4rLNsmjq6CJSKd7xvwsnoBV',
	  access_token_secret: '4fJYsMv2Xk59cxHzHjGaG7WOKLqyU4Earh6FNXlWI3Nyy'
	});


	var search = "Onmyoji"

	res.render('index', { title: 'test' });
});

module.exports = router;
