"use strict";
var socket = io();
var curZone;
var css = [];
var settings = [];
var state = [];
var inVolumeSlider = false;

let currInput;

let currSerialStatus

$(document).ready(function (){
    console.log("site ready")
    enableSockets();
    inputHandler();
    getSerialSelection();
    closeSerialPort();

})


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
        $("#serialPortList")
            .empty();
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

    socket.on("serialStatus", function(status) {
        currSerialStatus = status;
        if (currSerialStatus == "Closed") {
            $("#inputSelectors :input ").prop("disabled", true);
        } else {
            $("#inputSelectors :input ").prop("disabled", false);
        }
        $("#serialStatusDiv")
            .html("Current Serial Status: " + currSerialStatus);
    })
}

var selectedSerial;
var selectedBaud;

function getSerialSelection(){
    $("#serialOpenBtn").click(function() {
        var newSerial;
        var newBaud
        newSerial = $("#serialPortList").find(":selected").val();
        newBaud = $("#baudRateList").find(":selected").val();
        if ((selectedSerial != newSerial) || (selectedBaud != newBaud)) {
            selectedSerial = newSerial;
            selectedBaud = newBaud;
            console.log(newSerial + " at " + newBaud);
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
    socket.emit("changeInput", newInput);
}

