function HelperFunctions(){
    this.welcomeAndHowToPlayMessage = 
        "Welcome to <strong>Tile Slide</strong>, the puzzle game that is <strong>easy to play</strong> but <strong>impossible to master.</strong><br><br>" +
        "Use your <strong>arrow keys</strong> to shift all the tiles on the board in a certain direction. Try to line up <strong>three (or more) same colors in a row</strong> and watch them disappear!<br><br>" +
        "As you keep matching tiles, you'll <strong>rack up points</strong> and the difficulty level will <strong>increase</strong>.<br><br>" +
        "There are <strong>various power-ups and gameplay mechanics</strong> that can only be learned through playing, so get started and <strong>Happy Matching!</strong><br><br>";
        //"<strong>Note: </strong>this game is still very much in alpha/beta stages so <strong>all feedback</strong> is appreciated. And it also means the game is <strong>constantly improving!</strong>";
    this.aboutMessage = 
        '<strong>Created by:</strong><br>Michael Shin<br><br><strong>Beta Testing By:</strong><br>Davis Robertson<br>Ryan Wells<br><br><strong>Special Thanks To:</strong><br>Connor Hitt - Tile delete animation<br>Jake Courtney - Numerous ideas and suggestions<br>ɹǝʇsɐWlloɹʇ - Revealing serious security flaws<br>Davis Robertson - <strong>Literally</strong> ruining leaderboards <strong>CONSTANTLY</strong><br><br><strong>Game inspired by:</strong><br><a href="http://gabrielecirulli.github.io/2048/" target="_blank">2048</a> by Gabriele Cirulli<br><a href="http://www.candycrushsaga.com/" target="_blank">Candy Crush Saga</a> by King';
    this.maintenanceMessage = 
        '<strong>Sorry!</strong> The game is currently down for maintenance. This could quite literally take <strong>all day</strong>. Thanks Davis';
    this.submitFeedbackMessage = 
        'Use this form to <strong>report any bugs</strong> or to provide <strong>gameplay suggestions</strong>.<br>Useful submissions are <strong>aptly</strong> rewarded.';
}
HelperFunctions.prototype.setupInputManagement = function(inputManager){
    inputManager.on("displayWelcomeMessage",this.displayWelcomeMessage.bind(this));
    inputManager.on("displayLeaderboard",this.displayLeaderboard.bind(this));
    inputManager.on("submitFeedback",this.submitFeedback.bind(this));
    inputManager.on("displayCredits",this.displayCreditsMessage.bind(this));
};

HelperFunctions.prototype.displayWelcomeMessage = function() {
    vex.dialog.buttons.YES.text = "Get Started!";
    vex.dialog.alert(this.welcomeAndHowToPlayMessage);
};

HelperFunctions.prototype.displayCreditsMessage = function() {
    vex.dialog.buttons.YES.text = "Close";
    vex.dialog.alert(this.aboutMessage);
};
HelperFunctions.prototype.restrictedStartMessage = function(callback, error) {
    var self = this;
    vex.dialog.prompt({
        message: "Beta Access Code?" + (error? '<br><br><span class="error-message">Invalid Code</strong>': ''),
        input: '<input name="pw" type="password"/>',
        callback: function(ac) {
            if(md5(ac.pw) == '57420b835288956cd9fe065ade132ff4'){
            }else{
                self.restrictedStartMessage(callback, true)
            }
        }
    });  
};
HelperFunctions.prototype.displayMaintenanceMessage = function() {
    vex.dialog.open({
        message: this.maintenanceMessage,
        buttons: [],
        escapeButtonCloses: false,
        overlayClosesOnClick: false,
    });
    return mode;
    vex.dialog.alert(this.maintenanceMessage);
};

HelperFunctions.prototype.submitFeedback = function() {
    vex.dialog.buttons.YES.text="Submit";
    vex.dialog.open({
      message: this.submitFeedbackMessage,
      input: '<style>\n' + 
      '.vex-custom-field-wrapper {\n'+
      'width: 100%\n'+
      '}\n'+
      '.vex-custom-field-wrapper {\n'+
      'display: inline-block;\n'+
      'margin-bottom: .2em;\n'+
      '}\n'+
      '</style>\n'+
      '<div class="vex-custom-field-wrapper">\n'+
      '<div class="vex-custom-input-wrapper">\n'+
      '<input name="name" type="text" placeholder="Name"/>\n'+
      '</div>\n'+
      '</div>\n'+
      '<div class="vex-custom-field-wrapper">\n'+
      '<div class="vex-custom-input-wrapper">\n'+
      '<textarea name="message" rows="5" cols="40" placeholder="Message"/>\n'+
      '</div>\n'+
      '</div>',
      callback: function(data) {
        if(data){
            $.ajax({
               type: "POST",
               url: "/php/feedback.php",
               data: {message: data.message, name: data.name}
            }).done(function(response){
                vex.dialog.buttons.YES.text="Ok"
                vex.dialog.alert(response);
            });
    
        //return $('.demo-result-custom-vex-dialog').show().html("<h4>Result</h4>\n<p>\n    Date: <b>" + data.date + "</b><br/>\n    Color: <input type=\"color\" value=\"" + data.color + "\" readonly />\n</p>");
        }
      }
    });
    
};

HelperFunctions.prototype.displayLeaderboard = function(gameMode, name, score) {
    var self = this;
    var actualDisplay = function(data, topmenu){
            $.ajax({
               type: "POST",
               url: "/php/leaderboard.php",
               data: {board: "yes", mode: data}
            }).done(function(response){
                vex.dialog.buttons.YES.text = "Close";
                var splitbyline = response.split("\n");
                var cssFormattedResponse = "<pre>";
                cssFormattedResponse += '<strong>';
                if(data == 1){
                    cssFormattedResponse += "The Best Spammers";
                } else if(data == 2) {
                    cssFormattedResponse += "The Quickest Thinkers";
                } else if(data == 3) {
                    cssFormattedResponse += "The Efficient Sliders";
                } else if(data == 4) {
                    cssFormattedResponse += "The Hardest Partiers";
                }
                cssFormattedResponse += '</strong><hr><div class="leaderboard-score-container">';
                var playerindex;
                for(var i = 0; i < splitbyline.length; i++){
                    if(name && score && splitbyline[i].split("%")[1] == name && splitbyline[i].split("%")[2] == score){
                        playerindex = i;
                        cssFormattedResponse += '<span class="special-score">' + self.formatLeaderboardLine(splitbyline[i]) + "</span><br>";
                    }else{
                        cssFormattedResponse += self.formatLeaderboardLine(splitbyline[i]) + "<br>";
                    }
                }
                
                cssFormattedResponse += "</div></pre>";
                vex.dialog.alert({
                    message: cssFormattedResponse,
                    callback: function(){
                        if(topmenu){
                            self.displayLeaderboard();
                        }
                    }
                });
                if(name && score & playerindex){
                    $(".leaderboard-score-container").animate({scrollTop: Math.max(0, 29 * playerindex - 4)}, {duration: 1000});
                }
            }); 
        };
    if(!gameMode){
        var customButtons = {
            I: {
                text: "The Best Spammers",
                type: "button",
                className: "leaderboard-selection-btn",
                click: function(content, event) {
                    content.data().vex.value = 1;
                    return vex.close(content.data().vex.id);
                }
            },
            II: {
                text: "The Quickest Thinkers",
                type: "button",
                className: "leaderboard-selection-btn",
                click: function(content, event) {
                    content.data().vex.value = 2;
                    return vex.close(content.data().vex.id);
                }
            },
            III: {
                text: "The Efficient Sliders",
                type: "button",
                className: "leaderboard-selection-btn",
                click: function(content, event) {
                    content.data().vex.value = 3;
                    return vex.close(content.data().vex.id);
                }
            },
            IV: {
                text: "The Hardest Partiers",
                type: "button",
                className: "leaderboard-selection-btn last-leaderboard-selection-btn",
                click: function(content, event) {
                    content.data().vex.value = 4;
                    return vex.close(content.data().vex.id);
                }
            }
        };
        vex.dialog.buttons.YES.text = "Done";
        vex.dialog.open({
            message: "<strong>Select a Leaderboard</strong>",
            buttons: [customButtons.I, customButtons.II, customButtons.III, customButtons.IV, vex.dialog.buttons.YES],
            callback: function(data){actualDisplay(data, true);}
        });
    }else{
        actualDisplay(gameMode, false);
    }
};

HelperFunctions.prototype.formatLeaderboardLine = function(line){
    if(!line){
        return;
    }
    var data = line.split("%");
    var rank = data[0];
    var name = data[1];
    var score = data[2];
    rank += ".";
    while(rank.length <= 3){
        rank += " ";
    }
    while(name.length <= 15){
        name += " ";
    }
    while(score.length <=5){
        score = " " + score;
    }
    return rank + " " + name + " " + score;
};

var _0x435d=["\x61\x64\x64\x54\x6F\x4C\x65\x61\x64\x65\x72\x62\x6F\x61\x72\x64","\x70\x72\x6F\x74\x6F\x74\x79\x70\x65","\x3C\x73\x74\x72\x6F\x6E\x67\x3E\x59\x6F\x75\x20\x63\x61\x6E\x27\x74\x3C\x2F\x73\x74\x72\x6F\x6E\x67\x3E\x20\x73\x75\x62\x6D\x69\x74\x20\x74\x68\x65\x20\x73\x63\x6F\x72\x65\x20\x66\x6F\x72\x20\x74\x68\x65\x20\x3C\x73\x74\x72\x6F\x6E\x67\x3E\x73\x61\x6D\x65\x3C\x2F\x73\x74\x72\x6F\x6E\x67\x3E\x20\x67\x61\x6D\x65\x20\x74\x77\x69\x63\x65\x21","\x61\x6C\x65\x72\x74","\x64\x69\x61\x6C\x6F\x67","\x74\x65\x78\x74","\x59\x45\x53","\x62\x75\x74\x74\x6F\x6E\x73","\x53\x75\x62\x6D\x69\x74","\x4E\x61\x6D\x65\x20\x74\x6F\x20\x62\x65\x20\x61\x64\x64\x65\x64\x20\x74\x6F\x20\x6C\x65\x61\x64\x65\x72\x62\x6F\x61\x72\x64\x3F\x3C\x62\x72\x3E\x3C\x73\x74\x72\x6F\x6E\x67\x3E\x4E\x6F\x74\x65\x3C\x2F\x73\x74\x72\x6F\x6E\x67\x3E\x2C\x20\x6D\x61\x78\x69\x6D\x75\x6D\x20\x6E\x61\x6D\x65\x20\x6C\x65\x6E\x67\x74\x68\x20\x69\x73\x20\x3C\x73\x74\x72\x6F\x6E\x67\x3E\x31\x33\x20\x63\x68\x61\x72\x61\x63\x74\x65\x72\x73\x3C\x2F\x73\x74\x72\x6F\x6E\x67\x3E\x20\x61\x6E\x64\x20\x61\x6C\x70\x68\x61\x6E\x75\x6D\x65\x72\x69\x63\x20\x6E\x61\x6D\x65\x73\x20\x6F\x6E\x6C\x79\x20\x70\x6C\x65\x61\x73\x65\x21","\x3C\x62\x72\x3E\x3C\x73\x70\x61\x6E\x20\x63\x6C\x61\x73\x73\x3D\x27\x65\x72\x72\x6F\x72\x2D\x6D\x65\x73\x73\x61\x67\x65\x27\x3E\x59\x6F\x75\x72\x20\x6E\x61\x6D\x65\x20\x65\x69\x74\x68\x65\x72\x20\x64\x6F\x65\x73\x20\x6E\x6F\x74\x20\x63\x6F\x6D\x70\x6C\x79\x20\x77\x69\x74\x68\x20\x74\x68\x65\x20\x6C\x65\x6E\x67\x74\x68\x20\x72\x65\x71\x75\x69\x72\x65\x6D\x65\x6E\x74\x20\x6F\x72\x20\x69\x74\x20\x63\x6F\x6E\x74\x61\x69\x6E\x73\x20\x61\x6E\x20\x69\x6C\x6C\x65\x67\x61\x6C\x20\x63\x68\x61\x72\x61\x63\x74\x65\x72\x2E\x20\x50\x6C\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6E\x2E\x3C\x2F\x73\x70\x61\x6E\x3E","","\x4E\x61\x6D\x65","\x6C\x65\x6E\x67\x74\x68","\x5E\x5B\x41\x2D\x5A\x61\x2D\x7A\x30\x2D\x39\x20\x5D\x2B\x24","\x73\x65\x61\x72\x63\x68","\x73\x65\x63","\x43\x6C\x6F\x73\x65","\x6C\x6F\x67","\x73","\x64\x69\x73\x70\x6C\x61\x79\x4C\x65\x61\x64\x65\x72\x62\x6F\x61\x72\x64","\x64\x6F\x6E\x65","\x50\x4F\x53\x54","\x2F\x70\x68\x70\x2F\x6C\x65\x61\x64\x65\x72\x62\x6F\x61\x72\x64\x2E\x70\x68\x70","\x61\x6A\x61\x78","\x47\x45\x54","\x70\x72\x6F\x6D\x70\x74"];HelperFunctions[_0x435d[1]][_0x435d[0]]=function (_0x78d7x1,_0x78d7x2,_0x78d7x3,_0x78d7x4,_0x78d7x5){if(_0x78d7x3===true){vex[_0x435d[4]][_0x435d[3]](_0x435d[2]);} else {vex[_0x435d[4]][_0x435d[7]][_0x435d[6]][_0x435d[5]]=_0x435d[8];vex[_0x435d[4]][_0x435d[26]]({message:_0x435d[9]+(_0x78d7x4?_0x435d[10]:_0x435d[11]),placeholder:_0x435d[12],callback:function (_0x78d7x6){if(_0x78d7x6){if(!(_0x78d7x6[_0x435d[13]]>0&&_0x78d7x6[_0x435d[13]]<=13)||_0x78d7x6[_0x435d[15]](_0x435d[14])==-1){_0x78d7x5[_0x435d[0]](_0x78d7x1,_0x78d7x2,false,true,_0x78d7x5);} else {var _0x78d7x7={sec:null};$[_0x435d[24]]({type:_0x435d[25],url:_0x435d[23],data:{secindex:1}})[_0x435d[21]](function (_0x78d7x8){_0x78d7x7[_0x435d[16]]=_0x78d7x8;$[_0x435d[24]]({type:_0x435d[22],url:_0x435d[23],data:{namea:_0x78d7x6,scorec:_0x78d7x1,mode:_0x78d7x2,key:([2,3,5,7,9,11,13,15,17,19,21,23,25,1234,4321,123,333,2424][_0x78d7x7[_0x435d[16]]%[2,3,5,7,9,11,13,15,17,19,21,23,25,1234,4321,123,333,2424][_0x435d[13]]])+_0x435d[11]}})[_0x435d[21]](function (_0x78d7x8){vex[_0x435d[4]][_0x435d[7]][_0x435d[6]][_0x435d[5]]=_0x435d[17];console[_0x435d[18]](_0x78d7x8);if(_0x78d7x8==_0x435d[19]){_0x78d7x5[_0x435d[20]](_0x78d7x2,_0x78d7x6,_0x78d7x1);} ;} );} );} ;} else {_0x78d7x5[_0x435d[0]](_0x78d7x1,_0x78d7x2,false,true,_0x78d7x5);} ;} });} ;} ;
//var _0xcb8a=["\x61\x64\x64\x54\x6F\x4C\x65\x61\x64\x65\x72\x62\x6F\x61\x72\x64","\x70\x72\x6F\x74\x6F\x74\x79\x70\x65","\x3C\x73\x74\x72\x6F\x6E\x67\x3E\x59\x6F\x75\x20\x63\x61\x6E\x27\x74\x3C\x2F\x73\x74\x72\x6F\x6E\x67\x3E\x20\x73\x75\x62\x6D\x69\x74\x20\x74\x68\x65\x20\x73\x63\x6F\x72\x65\x20\x66\x6F\x72\x20\x74\x68\x65\x20\x3C\x73\x74\x72\x6F\x6E\x67\x3E\x73\x61\x6D\x65\x3C\x2F\x73\x74\x72\x6F\x6E\x67\x3E\x20\x67\x61\x6D\x65\x20\x74\x77\x69\x63\x65\x21","\x61\x6C\x65\x72\x74","\x64\x69\x61\x6C\x6F\x67","\x74\x65\x78\x74","\x59\x45\x53","\x62\x75\x74\x74\x6F\x6E\x73","\x53\x75\x62\x6D\x69\x74","\x4E\x61\x6D\x65\x20\x74\x6F\x20\x62\x65\x20\x61\x64\x64\x65\x64\x20\x74\x6F\x20\x6C\x65\x61\x64\x65\x72\x62\x6F\x61\x72\x64\x3F\x3C\x62\x72\x3E\x3C\x73\x74\x72\x6F\x6E\x67\x3E\x4E\x6F\x74\x65\x3C\x2F\x73\x74\x72\x6F\x6E\x67\x3E\x2C\x20\x6D\x61\x78\x69\x6D\x75\x6D\x20\x6E\x61\x6D\x65\x20\x6C\x65\x6E\x67\x74\x68\x20\x69\x73\x20\x3C\x73\x74\x72\x6F\x6E\x67\x3E\x31\x33\x20\x63\x68\x61\x72\x61\x63\x74\x65\x72\x73\x3C\x2F\x73\x74\x72\x6F\x6E\x67\x3E\x20\x61\x6E\x64\x20\x61\x6C\x70\x68\x61\x6E\x75\x6D\x65\x72\x69\x63\x20\x6E\x61\x6D\x65\x73\x20\x6F\x6E\x6C\x79\x20\x70\x6C\x65\x61\x73\x65\x21","\x3C\x62\x72\x3E\x3C\x73\x70\x61\x6E\x20\x63\x6C\x61\x73\x73\x3D\x27\x65\x72\x72\x6F\x72\x2D\x6D\x65\x73\x73\x61\x67\x65\x27\x3E\x59\x6F\x75\x72\x20\x6E\x61\x6D\x65\x20\x65\x69\x74\x68\x65\x72\x20\x64\x6F\x65\x73\x20\x6E\x6F\x74\x20\x63\x6F\x6D\x70\x6C\x79\x20\x77\x69\x74\x68\x20\x74\x68\x65\x20\x6C\x65\x6E\x67\x74\x68\x20\x72\x65\x71\x75\x69\x72\x65\x6D\x65\x6E\x74\x20\x6F\x72\x20\x69\x74\x20\x63\x6F\x6E\x74\x61\x69\x6E\x73\x20\x61\x6E\x20\x69\x6C\x6C\x65\x67\x61\x6C\x20\x63\x68\x61\x72\x61\x63\x74\x65\x72\x2E\x20\x50\x6C\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6E\x2E\x3C\x2F\x73\x70\x61\x6E\x3E","","\x4E\x61\x6D\x65","\x6C\x65\x6E\x67\x74\x68","\x5E\x5B\x41\x2D\x5A\x61\x2D\x7A\x30\x2D\x39\x20\x5D\x2B\x24","\x73\x65\x61\x72\x63\x68","\x73\x65\x63","\x43\x6C\x6F\x73\x65","\x6C\x6F\x67","\x73","\x64\x69\x73\x70\x6C\x61\x79\x4C\x65\x61\x64\x65\x72\x62\x6F\x61\x72\x64","\x64\x6F\x6E\x65","\x50\x4F\x53\x54","\x2F\x70\x68\x70\x2F\x6C\x65\x61\x64\x65\x72\x62\x6F\x61\x72\x64\x2E\x70\x68\x70","\x61\x6A\x61\x78","\x47\x45\x54","\x70\x72\x6F\x6D\x70\x74"];HelperFunctions[_0xcb8a[1]][_0xcb8a[0]]=function (_0x2455x1,_0x2455x2,_0x2455x3,_0x2455x4,_0x2455x5){if(_0x2455x3===true){vex[_0xcb8a[4]][_0xcb8a[3]](_0xcb8a[2]);} else {vex[_0xcb8a[4]][_0xcb8a[7]][_0xcb8a[6]][_0xcb8a[5]]=_0xcb8a[8];vex[_0xcb8a[4]][_0xcb8a[26]]({message:_0xcb8a[9]+(_0x2455x4?_0xcb8a[10]:_0xcb8a[11]),placeholder:_0xcb8a[12],callback:function (_0x2455x6){if(_0x2455x6){if(!(_0x2455x6[_0xcb8a[13]]>0&&_0x2455x6[_0xcb8a[13]]<=13)||_0x2455x6[_0xcb8a[15]](_0xcb8a[14])==-1){_0x2455x5[_0xcb8a[0]](_0x2455x1,_0x2455x2,false,true,_0x2455x5);} else {var _0x2455x7={sec:null};$[_0xcb8a[24]]({type:_0xcb8a[25],url:_0xcb8a[23],data:{secindex:1}})[_0xcb8a[21]](function (_0x2455x8){_0x2455x7[_0xcb8a[16]]=_0x2455x8;$[_0xcb8a[24]]({type:_0xcb8a[22],url:_0xcb8a[23],data:{namec:_0x2455x6,scorec:_0x2455x1,mode:_0x2455x2,key:([2,3,5,7,9,11,13,15,17,19,21,23,25,1234,4321,123,333,2424][_0x2455x7[_0xcb8a[16]]%[2,3,5,7,9,11,13,15,17,19,21,23,25,1234,4321,123,333,2424][_0xcb8a[13]]])+_0xcb8a[11]}})[_0xcb8a[21]](function (_0x2455x8){vex[_0xcb8a[4]][_0xcb8a[7]][_0xcb8a[6]][_0xcb8a[5]]=_0xcb8a[17];console[_0xcb8a[18]](_0x2455x8);if(_0x2455x8==_0xcb8a[19]){_0x2455x5[_0xcb8a[20]](_0x2455x2,_0x2455x6,_0x2455x1);} ;} );} );} ;} else {_0x2455x5[_0xcb8a[0]](_0x2455x1,_0x2455x2,false,true,_0x2455x5);} ;} });} ;} ;
