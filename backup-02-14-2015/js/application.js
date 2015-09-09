function Application(){
    this.gm;
    this.size = 6;
    this.start();
}
// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
    new Application();
});

Application.prototype.start = function(){
    this.go();
    //this.maintenance();
    //this.restrictedStart();
};

Application.prototype.go = function() {
    this.generateHTML(this.size);
    this.gm = new GameManager(this.size, KeyboardInputManager, HTMLActuator, LocalScoreManager, HelperFunctions);
    this.gm.helperFunctions.displayWelcomeMessage();
};

Application.prototype.maintenance = function() {
    var hf = new HelperFunctions();
    hf.displayMaintenanceMessage();
};

Application.prototype.restrictedStart = function() {
    this.go();
    this.gm.helperFunctions.restrictedStartMessage();
};

Application.prototype.restart = function(){
    this.gm.restart();
};

Application.prototype.generateHTML = function(size){
    var container = document.getElementsByClassName("grid-container")[0];
    var htmlToAdd = "";
    for(var m = 0; m < size; m++){
        htmlToAdd += '<div class="grid-row">\n';
        for(var n = 0; n<size; n++){
            htmlToAdd += '<div class="grid-cell"></div>';
        }
        htmlToAdd += '</div>\n';
    }
    container.innerHTML = htmlToAdd;
};