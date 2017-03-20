function toggleSearch(id) {
	var searchBar = document.getElementById(id);
	$("input#"+id).toggleClass("hide");
	$("input#"+id).val("");
}

function validateForm() {
    var team = document.getElementById('search')['team'].value;
    var init = team.charAt(0)
	if (init!='@' && init!='') {
		alert("Team name must be a Twitter handle");
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