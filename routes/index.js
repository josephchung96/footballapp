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

module.exports = router;
