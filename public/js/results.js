/**
* Football gossip is a data mining tool which
* uses twiiter api. and dbpedia to achieve the goal.
*
* @author  Wyman Chung, Joseph Chung, Declan Hui
* @version 1.0
* @since   2017-05-24
*/

// initialize socket.io
var socket = io();

// initialize chart object
var ctx = document.getElementById('chart');
var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: lwDate,
        datasets: [{
            label: 'Number of tweets',
            data: lwCount,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2
        }]
    },
    options: {
		responsive: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});

// chart sliding side button controller
var $chart = document.getElementById('chart');
var $toggleChart = document.getElementById('toggleChart');

$toggleChart.addEventListener('click', function() {
    var isOpen = $chart.classList.contains('slide-in');
	if (isOpen) {
		
		$('#sideChart').animate({
			'backgroundColor': '#fff'
		});
		
		$('#dim-wrapper').animate({
			'opacity':0
		}, function() {
			document.getElementById('dim-wrapper').style.zIndex = '-1';
			document.getElementById('sideChart').style.zIndex = 'auto';
			document.getElementById('chart').style.zIndex = 'auto';
			document.getElementById('toggleChart').style.backgroundImage = "url('/images/chart.png')";
		});
		
	} else {
		document.getElementById('dim-wrapper').style.zIndex = '1';
		document.getElementById('sideChart').style.zIndex = '3';
		document.getElementById('chart').style.zIndex = '2';
		
		document.getElementById('toggleChart').style.backgroundImage = "url('/images/chart_select.png')";
		
		$('#dim-wrapper').animate({
			'opacity':0.5,
		});
		
	}

    $chart.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
});


// player info sliding side button controller
var $playerInfoContainer = document.getElementById('playerInfoContainer');
var $togglePlayer = document.getElementById('togglePlayer');

if ($togglePlayer!=null) {
	$togglePlayer.addEventListener('click', function() {
		var isOpen = $playerInfoContainer.classList.contains('slide-in');
		if (isOpen) {
			
			$('#sidePlayer').animate({
				'backgroundColor': '#fff'
			});
			
			$('#dim-wrapper').animate({
				'opacity':0
			}, function() {
				document.getElementById('dim-wrapper').style.zIndex = '-1';
				document.getElementById('sidePlayer').style.zIndex = 'auto';
				document.getElementById('playerInfoContainer').style.zIndex = 'auto';
				document.getElementById('togglePlayer').style.backgroundImage = "url('/images/player.png')";
			});
			
		} else {
			document.getElementById('dim-wrapper').style.zIndex = '1';
			document.getElementById('sidePlayer').style.zIndex = '3';
			document.getElementById('playerInfoContainer').style.zIndex = '2';
			
			document.getElementById('togglePlayer').style.backgroundImage = "url('/images/player_select.png')";
			
			$('#dim-wrapper').animate({
				'opacity':0.5,
			});
			
		}

		$playerInfoContainer.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
	});
}
	


$(document).ready(function() {
	
	// initialize datatable object
    var table = $('.search-results').DataTable( {
			'searching': false,
			'lengthChange': false,
			'info': false,
			'order': [[ 3, 'desc' ]],
			'columnDefs': [{
				'targets': [1,2],
				'orderable': false
			}
			],
			'language': {
				'paginate': {
					'previous': '<',
					'next': '>'
				}
			}
		});
	
	// socket.io on 'tweet'
	socket.on('tweet', function(data){
		var author = "<a href='https://twitter.com/"+data.tweet.screenname+"'>"+data.tweet.username+"</a>\
			<br/><a class='screenname' href='https://twitter.com/"+data.tweet.screenname+"'>@"+data.tweet.screenname+"</a>";
		var content = data.tweet.content;
		var link = "<a class='tweeturl' href='https://twitter.com/id/status/"+data.tweet.tweetID+"'><span class='fa fa-external-link'></span></a>";
		var date = data.tweet.date;
		
		var row = table.row.add([
				author,
				content,
				link,
				date
			]).draw().node();
		$( row ).animate({
			backgroundColor:'#efb7c2'
		}, 1000, function(){
			$( row ).animate({
				backgroundColor:'transparent'
			}, 1000, function() {
				$( row ).animate({
					backgroundColor:'#efb7c2'
				}, 1000, function(){
					$( row ).animate({
						backgroundColor:'transparent'
					}, 1000, function() {
						$( row ).removeAttr('style');
					});
				});
			});
		});
		
		chart.data.datasets[0].data[6] += 1;
		chart.update();
		
	});

});
