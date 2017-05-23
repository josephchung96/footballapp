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

        $("#btnPlayer").on( 'click', function() {

            // toggle player search box
            if (!$("input#player").hasClass("hide")) {
                $("input#player").val("");
            }
            $("input#player").toggleClass("hide");

            // toggle search button
            if ($("input#btnSearch").hasClass("hide")) {
                $("input#btnSearch").toggleClass("hide");
            } else if ($("input#player").hasClass("hide") && $("input#team").hasClass("hide") && $("input#author").hasClass("hide")) {
                $("input#btnSearch").toggleClass("hide");
            }

            // toggle and/or buttons
            if (!$("input#team").hasClass("hide") && $("input#author").hasClass("hide")) {
                $("input#playerToTeam").toggleClass("hide");
            } else if ($("input#team").hasClass("hide") && !$("input#author").hasClass("hide")) {
                $("input#authorToPlayer").toggleClass("hide");
            } else if (!$("input#player").hasClass("hide") && !$("input#team").hasClass("hide") && !$("input#author").hasClass("hide")) {
                if ($("input#playerToTeam").hasClass("hide")) {
                    $("input#playerToTeam").toggleClass("hide");
                }
                if ($("input#teamToAuthor").hasClass("hide")) {
                    $("input#teamToAuthor").toggleClass("hide");
                }
                if (!$("input#authorToPlayer").hasClass("hide")) {
                    $("input#authorToPlayer").toggleClass("hide");
                }
            } else if ($("input#player").hasClass("hide") && !$("input#team").hasClass("hide") && !$("input#author").hasClass("hide")) {
                if ($("input#teamToAuthor").hasClass("hide")) {
                    $("input#teamToAuthor").toggleClass("hide");
                }
                if (!$("input#playerToTeam").hasClass("hide")) {
                    $("input#playerToTeam").toggleClass("hide");
                }
                if (!$("input#authorToPlayer").hasClass("hide")) {
                    $("input#authorToPlayer").toggleClass("hide");
                }
            }

        });

        $("#btnTeam").on( 'click', function() {

            //toggle team button
            if (!$("input#team").hasClass("hide")) {
                $("input#team").val("");
            }
            $("input#team").toggleClass("hide");

            // toggle search button
            if ($("input#btnSearch").hasClass("hide")) {
                $("input#btnSearch").toggleClass("hide");
            } else if ($("input#team").hasClass("hide") && $("input#player").hasClass("hide") && $("input#author").hasClass("hide")) {
                $("input#btnSearch").toggleClass("hide");
            }

            // toggle and/or buttons
            if (!$("input#player").hasClass("hide") && $("input#author").hasClass("hide")) {
                $("input#playerToTeam").toggleClass("hide");
            } else if ($("input#player").hasClass("hide") && !$("input#author").hasClass("hide")) {
                $("input#teamToAuthor").toggleClass("hide");
            } else if (!$("input#player").hasClass("hide") && !$("input#team").hasClass("hide") && !$("input#author").hasClass("hide")) {
                if ($("input#playerToTeam").hasClass("hide")) {
                    $("input#playerToTeam").toggleClass("hide");
                }
                if ($("input#teamToAuthor").hasClass("hide")) {
                    $("input#teamToAuthor").toggleClass("hide");
                }
                if (!$("input#authorToPlayer").hasClass("hide")) {
                    $("input#authorToPlayer").toggleClass("hide");
                }
            } else if (!$("input#player").hasClass("hide") && !$("input#author").hasClass("hide") && $("input#team").hasClass("hide")) {
                if ($("input#authorToPlayer").hasClass("hide")) {
                    $("input#authorToPlayer").toggleClass("hide");
                }
                if (!$("input#playerToTeam").hasClass("hide")) {
                    $("input#playerToTeam").toggleClass("hide");
                }
                if (!$("input#teamToAuthor").hasClass("hide")) {
                    $("input#teamToAuthor").toggleClass("hide");
                }
            }
        });

        $("#btnAuthor").on( 'click', function() {

            // toggle author button
            if (!$("input#author").hasClass("hide")) {
                $("input#author").val("")
            }
            $("input#author").toggleClass("hide");

            // toggle search button
            if ($("input#btnSearch").hasClass("hide")) {
                $("input#btnSearch").toggleClass("hide");
            } else if ($("input#team").hasClass("hide") && $("input#player").hasClass("hide") && $("input#author").hasClass("hide")) {
                $("input#btnSearch").toggleClass("hide");
            }

            //toggle and/or buttons
            if (!$("input#player").hasClass("hide") && $("input#team").hasClass("hide")) {
                $("input#authorToPlayer").toggleClass("hide");
            } else if ($("input#player").hasClass("hide") && !$("input#team").hasClass("hide")) {
                $("input#teamToAuthor").toggleClass("hide");
            } else if (!$("input#player").hasClass("hide") && !$("input#team").hasClass("hide") && !$("input#author").hasClass("hide")) {
                if ($("input#playerToTeam").hasClass("hide")) {
                    $("input#playerToTeam").toggleClass("hide");
                }
                if ($("input#teamToAuthor").hasClass("hide")) {
                    $("input#teamToAuthor").toggleClass("hide");
                }
                if (!$("input#authorToPlayer").hasClass("hide")) {
                    $("input#authorToPlayer").toggleClass("hide");
                }
            } else if (!$("input#player").hasClass("hide") && !$("input#team").hasClass("hide") && $("input#author").hasClass("hide")) {
                if ($("input#playerToTeam").hasClass("hide")) {
                    $("input#playerToTeam").toggleClass("hide");
                }
                if (!$("input#authorToPlayer").hasClass("hide")) {
                    $("input#authorToPlayer").toggleClass("hide");
                }
                if (!$("input#teamToAuthor").hasClass("hide")) {
                    $("input#teamToAuthor").toggleClass("hide");
                }
            }
        });

        // toggle the first and/or button
        $("input#playerToTeam").on("click", function() {
            var button = document.getElementById("playerToTeam");
            if (button.value=='and') {
                button.value='or';
            } else {
                button.value='and';
            }
        })
        //toggle the second and/or button
        $("input#authorToPlayer").on("click", function() {
            var button = document.getElementById("authorToPlayer");
            if (button.value=='and') {
                button.value='or';
            } else {
                button.value='and';
            }
        })
        //toggle the third and/or button
        $("input#teamToAuthor").on("click", function() {
            var button = document.getElementById("teamToAuthor");
            if (button.value=='and') {
                button.value='or';
            } else {
                button.value='and';
            }
        })

        $("btnSearch").on("click", validateForm());

    }
};

function validateForm() {

    var player = document.getElementById('search-form')['player'].value;
    var team = document.getElementById('search-form')['team'].value;
    var author = document.getElementById('search-form')['author'].value;

    var author1 = author.charAt(0);

    alert(player);

//    if (player == '' && team == '' && author == '') {
//        alert("Search fields cannot be empty!");
//        return false;
//    } else if (author1 != '@' && author1 != '') {
//        alert("Author must be a Twitter handle! '@' ");
//        return false;
//    } else {
        sendAjaxQuery('postFile', JSON.stringify($("#search-form").seralizeObject()));
//    }

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

app.initialize();
