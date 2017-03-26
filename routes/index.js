var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/trends', function(req, res, next){
  var lastWeekCount = req.app.get('lastWeekCount');
  var lastWeekDates = req.app.get('lastWeekDates');
  console.log(lastWeekCount==null);
  console.log(lastWeekDates==null);
  if (lastWeekCount==null || lastWeekDates==null) {
    res.render('trends', { title: 'Trends' });
  }else{
    res.render('trends', { title: 'Trends', lwCount: lastWeekCount, lwDate: lastWeekDates });
  }
})
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
