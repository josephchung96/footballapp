$(document).ready(function() {
    $('.search-results').DataTable( {
        "searching": false,
        "lengthChange": false,
        "info": false,
		"language": {
			"paginate": {
				"previous": "<",
				"next": ">"
			}
		}
    } );
} );