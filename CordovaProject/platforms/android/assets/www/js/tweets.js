var express = require('express');
var router = express.Router();

function searchTweets() {

    var today = new Date();
    var lastWeek = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    var lastWeekCount = new Array(7).fill(0);
    var lastWeekDates = new Array(7).fill(0);

}