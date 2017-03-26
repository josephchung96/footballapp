var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/trends', function(req, res, next){
  var lastWeekCount = req.app.get('lastWeekCount');
  console.log(lastWeekCount==null);
  if (lastWeekCount==null) {
    res.render('trends', { title: 'Trends' });
  }else{
    res.render('trends', { title: 'Trends', temp: lastWeekCount });
  }
});
router.get('/output', function(req, res, next) {
  res.render('output', { title: 'Output'});
});
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
