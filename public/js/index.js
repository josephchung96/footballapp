function toggleSearch(id) {
	id = id.split("-")[1];
	var searchBar = document.getElementById(id);
	
	if (!$("input#"+id).hasClass("hide")) {
		$("input#"+id).val("");
	}
	$("input#"+id).toggleClass("hide");
	
	if ($("input#submit").hasClass("hide")) {
		$("input#submit").toggleClass("hide");
	} else if ($("input#player").hasClass("hide") && $("input#team").hasClass("hide") && $("input#author").hasClass("hide")) {
		$("input#submit").toggleClass("hide");
	}
	
	if (id!="author") {
		if (!$("input#player").hasClass("hide") && !$("input#team").hasClass("hide")) {
			$("input#playerToTeam").toggleClass("hide");
			$("input#playerToTeam").val('and');
		} else if (!$("input#playerToTeam").hasClass("hide")) {
			$("input#playerToTeam").val('');
			$("input#playerToTeam").toggleClass("hide");
		}
	}
	
	if (id!="team") {
		if (!$("input#player").hasClass("hide") && !$("input#author").hasClass("hide") && $("input#playerToTeam").hasClass("hide")) {
			$("input#authorToPlayer").toggleClass("hide");
			$("input#authorToPlayer").val('and');
		} else if (!$("input#authorToPlayer").hasClass("hide")) {
			$("input#authorToPlayer").val('');
			$("input#authorToPlayer").toggleClass("hide");
		}
	} else if (!$("input#authorToPlayer").hasClass("hide")) {
		$("input#authorToPlayer").val('');
		$("input#authorToPlayer").toggleClass("hide");
	} else if (!$("input#player").hasClass("hide") && !$("input#author").hasClass("hide")) {
		$("input#authorToPlayer").val('and');
		$("input#authorToPlayer").toggleClass("hide");
	}
	
	if (id!="player") {
		if (!$("input#team").hasClass("hide") && !$("input#author").hasClass("hide")) {
			$("input#teamToAuthor").toggleClass("hide");
			$("input#teamToAuthor").val('and');
		} else if (!$("input#teamToAuthor").hasClass("hide")) {
			$("input#teamToAuthor").val('');
			$("input#teamToAuthor").toggleClass("hide");
		}
	}
	
	
}

function toggleOperand(id) {
	var button = document.getElementById(id);
	if (button.value=='and') {
		button.value ='or';
	} else {
		button.value ='and';
	}
}

function validateForm() {
    var player;
    var team;
    var author;
		
    var teamInit;
    var authorInit;
	
	
    player = document.getElementById('search')['player'].value;
    team = document.getElementById('search')['team'].value;
    author = document.getElementById('search')['author'].value;	
	
    teamInit = team.charAt(0);
    authorInit = author.charAt(0);
	
	console.log (JSON.stringify($("#search").serializeObject()));
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