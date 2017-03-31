function toggleSearch(id) {
	id = id.split("-")[1];
	var searchBar = document.getElementById(id);
	$("input#"+id).toggleClass("hide");
	$("input#"+id).val("");
}

function validateForm() {
    var player = document.getElementById('search')['player'].value;
    var team = document.getElementById('search')['team-id'].value;
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

  $( function() {
    var team = [
		{
			value: "@ManUtd",
			label: "Manchester United",
			desc: "@ManUtd",
			icon: "https://pbs.twimg.com/profile_images/828725640866172930/xihmUAVo_400x400.jpg"
		},
		{
			value: "@ManCity",
			label: "Manchester City",
			desc: "@ManCity",
			icon: "https://pbs.twimg.com/profile_images/803167098033864704/L89InOWr_400x400.jpg"
		}
	];
 
    $( "#team" ).autocomplete({
      minLength: 0,
      source: team,
      focus: function( event, ui ) {
        $( "#team" ).val( ui.item.label );
        return false;
      },
      select: function( event, ui ) {
        $( "#team" ).val( ui.item.label );
        $( "#team-id" ).val( ui.item.value );
        $( "#team-description" ).html( ui.item.desc );
        $( "#team-description" ).toggleClass("hide");
        $( "#team" ).css( "background-image", 'url('+ui.item.icon+')' );
 
        return false;
      }
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
      return $( "<li>" )
        .append( "<div class='team-name'>" + item.label + "</div><div class='team-desc'>" + item.desc + "</div>" )
        .appendTo( ul );
    };
  });