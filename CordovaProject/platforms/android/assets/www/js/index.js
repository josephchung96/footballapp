/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {

        // buttons for the search options
        $("#btnPlayer").on( 'click', toggleSearch);
        $("#btnTeam").on( 'click', toggleSearch);
        $("#btnAuthor").on( 'click', toggleSearch);

        // toggle the and/or button
        $("#playerToTeam").on( 'click', toggleOperand);
        $("#authorToPlayer").on( 'click', toggleOperand);
        $("#teamToAuthor").on( 'click', toggleOperand);

        $("#submit").on("click", validateForm);

        // RESULTS PAGE redirect to homepage
        $("#btnBack").on("click", function() {
            $("#results_page").toggleClass("hide");
            $("#home_page").toggleClass("hide");
        });

    }
};

// used to toggle the different textboxes
function toggleSearch() {
    var id = this.id.replace("btn", "").toLowerCase();
    var searchBar = document.getElementById(id);

    if (!$("input#"+id).hasClass("hide")) {
        $("input#"+id).val("");
    }
    $("input#"+id).toggleClass("hide");

    if ($("input#submit").hasClass("hide")) {
        $("input#submit").toggleClass("hide");
        $("label#searchOption").toggleClass("hide");
    } else if ($("input#player").hasClass("hide") && $("input#team").hasClass("hide") && $("input#author").hasClass("hide")) {
        $("input#submit").toggleClass("hide");
        $("label#searchOption").toggleClass("hide");
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

// used to toggle the and/or displays
function toggleOperand() {
    var id = this.id;
	var button = document.getElementById(id);
	if (button.value=='and') {
		button.value ='or';
	} else {
		button.value ='and';
	}
}

// validate the input from user
function validateForm() {

    var player;
    var team;
    var author;

    var authorInit;

    player = $("#player").val();
    team = $("#team").val();
    author = $("#author").val();

    authorInit = author.charAt(0);

    if (player=='' && team=='' && author=='') {
        alert("Search field cannot be empty");
    }else if (authorInit!='@' && authorInit!='') {
        alert("Author must be a Twitter handle");
    }else{ // success
        sendAjaxQuery('http://10.0.2.2:3000/postFile', JSON.stringify($("#search-form").serializeObject()));
    }
     return false;
}

function sendAjaxQuery(url, data) {
    // twitter querying
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        contentType: 'application/json',
        success: function (data) { // redirect
            $("#home_page").toggleClass("hide");
            $("#loading_bar").toggleClass("hide");
            var socket = io.connect('http://10.0.2.2:3000');
            updateLoading(socket);
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

// loading  bar
function updateLoading(socket) {
    socket.on('dbOnly', function(data){
		var bar = document.getElementById("myBar");
		var status = document.getElementById("status");

		var width = 1;
		var redirectDelay = 3000;
		var progress;

		function frame() {
			if (width >= progress) {
				clearInterval(id);
			} else {
				width++;
				bar.style.width = width + '%';
			}
		}

		if (data.message=='error') {
            progress = 100;
            status.innerHTML = "Connection to database could not be established, redirecting...";
            bar.style.backgroundColor = "#cc0000";
            setTimeout(function() {
                $("#loading_bar").toggleClass("hide");
                $("#home_page").toggleClass("hide");
            }, redirectDelay);
		}
		if (data.message=='done') {
            progress = 100;
			status.innerHTML = "Data retrieved from database, redirecting...";
			setTimeout(function() {
                $("#loading_bar").toggleClass("hide");
                $("#results_page").toggleClass("hide");
                initializeTable(data.tweets);
			}, redirectDelay);
		}

		var id = setInterval(frame, 10);
	});

	socket.on('restAPI', function(data){
        var bar = document.getElementById("myBar");
		var status = document.getElementById("status");

		var width;
		var progress;
		var redirectDelay = 3000;

		function frame() {
			if (width >= progress) {
				clearInterval(id);
			} else {
				width++;
				bar.style.width = width + '%';
			}
		}

		if (data.message=='dbError') {
			width = 0;
			progress = 33;
			status.innerHTML = "...";
			bar.style.backgroundColor = "#fbd744";
			status.innerHTML = "Connection to database could not be established, tweets will not be saved.";
		}
		if (data.message=='dbSuccess') {
			width = 0;
			progress = 33;
			status.innerHTML = "Connection to database established, tweets will be saved.";
		}
		if (data.message=='done') {
			width = 33;
			progress = 100;
			status.innerHTML = "Data retrieved from Twitter, redirecting...";
			setTimeout(function() {
                $("#loading_bar").toggleClass("hide");
                $("#results_page").toggleClass("hide");
                initializeTable(data.tweets);
			}, redirectDelay);
		}

		var id = setInterval(frame, 10);
	});
}

// settings for the results table
function initializeTable(tweets){
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
    // iterate over all the tweets
    for (tweet in tweets) {
        var author = "<a href='https://twitter.com/"+tweets[tweet][1]+"'>"+tweets[tweet][0]+"</a><br/><a class='screenname' href='https://twitter.com/"+tweets[tweet][1]+"'>@"+tweets[tweet][1]+"</a>";
        var content = tweets[tweet][2];
        var link = "<a class='tweeturl' href='https://twitter.com/id/status/"+tweets[tweet][5]+"'><span class='fa fa-external-link'></span></a>";
        var date = tweets[tweet][3];

        var row = table.row.add([
                author,
                content,
                link,
                date
            ]).draw()
    }
}


app.initialize();
