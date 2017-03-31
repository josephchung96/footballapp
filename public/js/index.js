function toggleSearch(id) {
	var searchBar = document.getElementById(id);
	$("input#"+id).toggleClass("hide");
	$("input#"+id).val("");
}

function validateForm() {
    var player = document.getElementById('search')['player'].value;
    var team = document.getElementById('search')['team'].value;
    var author = document.getElementById('search')['author'].value;
    var teamInit = team.charAt(0);
    var authorInit = author.charAt(0);
	if (player=='' && team=='' && author=='') {
		alert("Search field cannot be empty");
        return false;
	}else if (teamInit!='@' && teamInit!='') {
		alert("Team name must be a Twitter handle");
        return false;
	}else if (authorInit!='@' && authorInit!='') {
		alert("Author must be a Twitter handle");
        return false;
	}else{
		sendAjaxQuery('postFile', JSON.stringify($("#search").serializeObject()));
	}
}

function sendAjaxQuery(url, data) {
	$.ajax({
		type: 'POST',
		url: url,
		data: data,
		contentType: 'application/json',
		success: function (data) {	
		},
		error: function (xhr, status, error) {
		}
	});
}


$.fn.serializeObject = function () {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function () {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};