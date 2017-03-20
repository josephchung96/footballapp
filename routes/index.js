var express = require('express');
var router = express.Router();
var template = new Array(10).fill(0);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/trends', function(req, res, next){
  res.render('trends', {
    title: 'Trends',
    temp: template 
  });
})
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
