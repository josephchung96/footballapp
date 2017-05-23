$(document).ready(function() {
    $('.search-results').DataTable( {
        "searching": false,
        "lengthChange": false,
        "info": false,
		"order": [[ 3, "desc" ]],
		"columnDefs": [{
			"targets": [1,2],
			"orderable": false
		}
		],
		"language": {
			"paginate": {
				"previous": "<",
				"next": ">"
			}
		}
    });
});

var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
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

var $myChart = document.getElementById('myChart');
var $toggle = document.getElementById('toggleChart');

$toggle.addEventListener('click', function() {
    var isOpen = $myChart.classList.contains('slide-in');
	if (isOpen) {
		
		$("#sideChart").animate({
			'backgroundColor': "#fff"
		});
		
		$("#dim-wrapper").animate({
			'opacity':0
		}, function() {
			document.getElementById("dim-wrapper").style.zIndex = "-1";
			document.getElementById("sideChart").style.zIndex = "auto";
			document.getElementById("myChart").style.zIndex = "auto";
			document.getElementById("toggleChart").style.backgroundImage = "url('/images/chart.png')";
		});
		
	} else {
		document.getElementById("dim-wrapper").style.zIndex = "1";
		document.getElementById("sideChart").style.zIndex = "2";
		document.getElementById("myChart").style.zIndex = "2";
		
		document.getElementById("toggleChart").style.backgroundImage = "url('/images/chart_select.png')";
		
		$("#dim-wrapper").animate({
			'opacity':0.5,
		});
		
	}

    $myChart.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
});