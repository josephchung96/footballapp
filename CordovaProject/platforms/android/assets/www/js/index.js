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

        $("#btnPlayer").on( 'click', toggleSearch);

        $("#btnTeam").on( 'click', toggleSearch);

        $("#btnAuthor").on( 'click', toggleSearch);

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

        //document.getElementById("btnSearch").addEventListener("click", validateForm);
        $("#submit").on("click", validateForm);
//        document.getElementById("btnSearch").addEventListener("click", sendAjaxQuery('postFile', JSON.stringify($("#search-form").serializeObject()));
//        $("btnSearch").on("click", function() {
//            var homePage = document.getElementById("home_page");
//            var resultsPage = document.getElementById("results_page");
//            var player = document.getElementById("player").value;
//            var team = document.getElementById("team").value;
//            var author = document.getElementById("author").value;
//            // TODO: validation function needed
//            resultsPage.style.display = "block";
//            homePage.style.display = "none";
//        });

    }
};

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
        return false;
    }else if (authorInit!='@' && authorInit!='') {
        alert("Author must be a Twitter handle");
        return false;
    }else{
        sendAjaxQuery('http://10.0.2.2:3000/postFile', JSON.stringify($("#search-form").serializeObject()));
    }
}

function sendAjaxQuery(url, data) {
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        contentType: 'application/json',
        success: function (data) {
            if (!$("#home_page").hasClass("hide")) {
                $("#home_page").toggleClass("hide");
                if ($("#loading_bar").hasClass("hide")) {
                    $("#loading_bar").toggleClass("hide");
                }
            }
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
