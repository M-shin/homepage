function KeyboardInputManager() {
  this.events = {};
  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
   
  };

  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }
    }
  });

  var retry = document.querySelector(".retry-button");
  retry.addEventListener("click", this.restart.bind(this));
  
  var selectNew = document.querySelector(".select-new-button");
  selectNew.addEventListener("click", this.selectNew.bind(this));
  
  var addToLeaderboard = document.querySelector(".add-to-leaderboard-button");
  addToLeaderboard.addEventListener("click", this.addToLeaderboard.bind(this));
  
  var restart = document.querySelector(".start-over-button-container");
  restart.addEventListener("click", this.selectNew.bind(this));
  
  var displayWelcomeMessage = document.querySelector(".display-welcome-message-container");
  displayWelcomeMessage.addEventListener("click", this.displayWelcomeMessage.bind(this));
  
  var displayLeaderboard = document.querySelector(".leaderboard-container");
  displayLeaderboard.addEventListener("click", this.displayLeaderboard.bind(this));
  
  var submitFeedback = document.querySelector(".submit-feedback-container");
  submitFeedback.addEventListener("click", this.submitFeedback.bind(this));
  
  var displayCredits = document.querySelector(".credits-container");
  displayCredits.addEventListener("click", this.displayCredits.bind(this));
  
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.addToLeaderboard = function (event) {
    event.preventDefault();
    this.emit("addToLeaderboard");
};

KeyboardInputManager.prototype.displayWelcomeMessage = function (event) {
    event.preventDefault();
    this.emit("displayWelcomeMessage")
};

KeyboardInputManager.prototype.displayLeaderboard = function (event) {
    event.preventDefault();
    this.emit("displayLeaderboard");
};

KeyboardInputManager.prototype.submitFeedback = function (event) {
    event.preventDefault();
    this.emit("submitFeedback");
};

KeyboardInputManager.prototype.displayCredits = function (event) {
    event.preventDefault();
    this.emit("displayCredits");
};

KeyboardInputManager.prototype.selectNew = function (event){
    event.preventDefault();
    this.emit("selectNewMode");
}

KeyboardInputManager.prototype.screenshot = function (event) {
    event.preventDefault();
    html2canvas(document.body, {
        onrendered: function(canvas){
            $.ajax({
                type: "POST",
                url: "/php/uploadSS.php",
                data: {data: canvas.toDataURL()}
            }).done(function(response){
                $.ajax({
                    type: "GET",
                    url: "/php/uploadSS.php",
                    data: {name: response}
                })
            });
        }
    });
}
