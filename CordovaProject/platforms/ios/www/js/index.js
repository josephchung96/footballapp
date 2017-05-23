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

        // toggle the first and/or button
        $("#btnAndOr1").on("click", function() {
            var button = document.getElementById("btnAndOr1");
            if (button.innerHTML=='and') {
                button.innerHTML='or';
            } else {
                button.innerHTML='and';
            }
        })
        //toggle the second and/or button
        $("#btnAndOr2").on("click", function() {
            var button = document.getElementById("btnAndOr2");
            if (button.innerHTML=='and') {
                button.innerHTML='or';
            } else {
                button.innerHTML='and';
            }
        });
        $("btnSearch").on("click", function() {
            var homePage = document.getElementById("home_page");
            var resultsPage = document.getElementById("results_page");
            var player = document.getElementById("player").value;
            var team = document.getElementById("team").value;
            var author = document.getElementById("author").value;
            // TODO: validation function needed
            resultsPage.style.display = "block";
            homePage.style.display = "none";
        });

    }
};

function displayDivs() {



}


app.initialize();
