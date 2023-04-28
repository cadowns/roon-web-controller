var socket = io();
let currInput;
$(document).ready(function () {
    enableSockets();
    checkCurrentInput();
})


function enableSockets() {
    socket.on("currInputUpdate", function(newInput) {
        if (currInput != newInput) {
            currInput = newInput;
            $("#inputInfo").html("Now Playing: " + currInput);
        }
    })
}