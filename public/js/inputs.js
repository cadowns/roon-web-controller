"use strict";
var socket = io();
var curZone;
var css = [];
var settings = [];
var state = [];
var inVolumeSlider = false;

var selectedSerial;
var selectedBaud;

let currInput;

let currSerialStatus

$(document).ready(function (){
    console.log("site ready")
    checkForSerialCookies();
    enableSockets();
    inputHandler();
    getSerialSelection();
    closeSerialPort();

})

function checkForSerialCookies(){
    let portCookie = Cookies.get("serialPort");
    let baudCookie = Cookies.get("serialBaud");
    let baudIndex = Cookies.get("serialBaudIndex");
    let portIndex = Cookies.get("serialPortIndex");
    if (portCookie==null || baudCookie==null){
        console.log("no port or baud cookie found");
    } else {
        console.log("serial cookies found: " + portCookie + " at " + baudCookie);
        selectedSerial = portCookie;
        selectedBaud = baudCookie;
        $("#serialPortList").prop('selectedIndex', portIndex);
        $("#baudRateList").prop('selectedIndex', baudIndex);
        serialStatus(Cookies.get("serialStatus"));
        $("#serialOpenBtn").prop("disabled",true)
        $("#serialCloseBtn").prop("disabled", false)
    }
}


function enableSockets() {
    socket.on("currInputUpdate", function(newInput) {
        if (currInput != newInput) {
            currInput = newInput;
            state.currInputBig = currInput;
            $("#currInputBig")
                .html("Current Input: " + state.currInputBig)
            switch (newInput){
                case "Raspberry Pi":
                    $("#inputRpi")
                        .attr("onclick", "sendInputChange('!')")
                        .addClass("inputSelected")
                    $("#inputOpt")
                        .attr("onclick", "sendInputChange('@')")
                        .removeClass("inputSelected")
                    $("#inputRCA")
                        .attr("onclick", "sendInputChange('#')")
                        .removeClass("inputSelected")
                    $("#inputHDMI")
                        .attr("onclick", "sendInputChange('$')")
                        .removeClass("inputSelected")
                    $("#inputUSB")
                        .attr("onclick", "sendInputChange('%')")
                        .removeClass("inputSelected")
                    break;
                case "Optical":
                    $("#inputRpi")
                        .attr("onclick", "sendInputChange('!')")
                        .removeClass("inputSelected")
                    $("#inputOpt")
                        .attr("onclick", "sendInputChange('@')")
                        .addClass("inputSelected")
                    $("#inputRCA")
                        .attr("onclick", "sendInputChange('#')")
                        .removeClass("inputSelected")
                    $("#inputHDMI")
                        .attr("onclick", "sendInputChange('$')")
                        .removeClass("inputSelected")
                    $("#inputUSB")
                        .attr("onclick", "sendInputChange('%')")
                        .removeClass("inputSelected")
                    break;
                case "RCA":
                    $("#inputRpi")
                        .attr("onclick", "sendInputChange('!')")
                        .removeClass("inputSelected")
                    $("#inputOpt")
                        .attr("onclick", "sendInputChange('@')")
                        .removeClass("inputSelected")
                    $("#inputRCA")
                        .attr("onclick", "sendInputChange('#')")
                        .addClass("inputSelected")
                    $("#inputHDMI")
                        .attr("onclick", "sendInputChange('$')")
                        .removeClass("inputSelected")
                    $("#inputUSB")
                        .attr("onclick", "sendInputChange('%')")
                        .removeClass("inputSelected")
                    break;
                case "HDMI":
                    $("#inputRpi")
                        .attr("onclick", "sendInputChange('!')")
                        .removeClass("inputSelected")
                    $("#inputOpt")
                        .attr("onclick", "sendInputChange('@')")
                        .removeClass("inputSelected")
                    $("#inputRCA")
                        .attr("onclick", "sendInputChange('#')")
                        .removeClass("inputSelected")
                    $("#inputHDMI")
                        .attr("onclick", "sendInputChange('$')")
                        .addClass("inputSelected")
                    $("#inputUSB")
                        .attr("onclick", "sendInputChange('%')")
                        .removeClass("inputSelected")
                    break;
                case "USB":
                    $("#inputRpi")
                        .attr("onclick", "sendInputChange('!')")
                        .removeClass("inputSelected")
                    $("#inputOpt")
                        .attr("onclick", "sendInputChange('@')")
                        .removeClass("inputSelected")
                    $("#inputRCA")
                        .attr("onclick", "sendInputChange('#')")
                        .removeClass("inputSelected")
                    $("#inputHDMI")
                        .attr("onclick", "sendInputChange('$')")
                        .removeClass("inputSelected")
                    $("#inputUSB")
                        .attr("onclick", "sendInputChange('%')")
                        .addClass("inputSelected")
                    break;
                default:
                    break;
            }
        } else {

        }
    })

    socket.on("availSerialPorts", function(portList, friendlyNames) {
        $("#serialPortList").empty();
        console.log("In function " + portList)
        console.log(friendlyNames);
        for(var x in portList) {
            console.log(x)
            $("#serialPortList")
                .append($('<option>', {
                   value: portList[x],
                    text: friendlyNames[x],
                    id: "string"
            }));
        }
    })

    socket.on("serialStatus", (status) => {
        serialStatus(status);
    });
}

function serialStatus(status) {
    currSerialStatus = status;
    //console.log(currSerialStatus);
    Cookies.set("serialStatus", currSerialStatus, {expires: 365});
    if (currSerialStatus == "Closed") {
        $("#inputSelectors :input ").prop("disabled", true);
    } else {
        $("#inputSelectors :input ").prop("disabled", false);
    }
    $("#serialStatusDiv")
        .html("Current Serial Status: " + currSerialStatus);
}





function getSerialSelection(){
    $("#serialOpenBtn").click(function() {
        var newSerial;
        var newBaud
        newSerial = $("#serialPortList").find(":selected").val();
        let newSerialIndex = $("#serialPortList").find(":selected").index();
        newBaud = $("#baudRateList").find(":selected").val();
        let newBaudIndex = $("#baudRateList").find(":selected").index();
        console.log(newSerialIndex + " " + newBaudIndex);
        if ((selectedSerial != newSerial) || (selectedBaud != newBaud)) {
            selectedSerial = newSerial;
            selectedBaud = newBaud;
            console.log(newSerial + " at " + newBaud);
            Cookies.set("serialPort", selectedSerial, {expires: 365});
            Cookies.set("serialPortIndex", newSerialIndex, {expires: 365});
            Cookies.set("serialBaud", selectedBaud, {expires: 365});
            Cookies.set("serialBaudIndex", newBaudIndex, {expires: 365});
            sendSerialPort(selectedSerial, selectedBaud);
            $("#serialOpenBtn").prop("disabled",true)
            $("#serialCloseBtn").prop("disabled", false)

        }
    })
};

function closeSerialPort() {
    $("#serialCloseBtn").click(function() {
        selectedBaud = '';
        selectedSerial = '';
        Cookies.remove("serialPort");
        Cookies.remove("serialBaud");
        socket.emit("closeSerial");
        $("#serialOpenBtn").prop("disabled",false)
        $("#serialCloseBtn").prop("disabled", true)
    })
}


function sendSerialPort(port, baud){
    socket.emit("openSerial", port, baud);
}

function inputHandler() {
    $("#inputRpi")
        .attr("onclick", "sendInputChange('!')")
    $("#inputOpt")
        .attr("onclick", "sendInputChange('@')")
    $("#inputRCA")
        .attr("onclick", "sendInputChange('#')")
    $("#inputHDMI")
        .attr("onclick", "sendInputChange('$')")
    $("#inputUSB")
        .attr("onclick", "sendInputChange('%')")
}

function sendInputChange(newInput){
    let inputString;
    switch (newInput) {
        case '!':
            inputString = "Rapsberry Pi";
            break;
        case '@':
            inputString = "Optical";
            break;
        case '#':
            inputString = "Coaxial";
            break;
        case '$':
            inputString = "HDMI";
            break;
        case '%':
            inputString = "USB";
            break;
    }
    console.log("Input changed via web: " + newInput + " " + inputString);
    socket.emit("changeInput", newInput, inputString);
}

