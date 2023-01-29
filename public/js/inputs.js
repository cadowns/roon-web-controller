"use strict";
var socket = io();
var curZone;
var css = [];
var settings = [];
var state = [];
var inVolumeSlider = false;

let currInput;

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
        for(var x in portList) {
            console.log(x)
            $("#serialPortList")
                .append($('<option>', {
                   value: portList[x],
                    text: friendlyNames[x]
            }));
        }
    })

    socket.on("serialStatus", function(status) {
        $("#serialStatusDiv")
            .html("Current Serial Status: " + status);
    })
}

var selectedSerial;

function getSerialSelection(){
    $("#serialOpenBtn").click(function() {
        var newSerial;
        newSerial = $("#serialPortList").find(":selected").val();
        if (selectedSerial != newSerial) {
            selectedSerial = newSerial;
            console.log(newSerial);
            sendSerialPort(selectedSerial);
            $("#serialOpenBtn").prop("disabled",true)
            $("#serialCloseBtn").prop("disabled", false)

        }
    })
};

function closeSerialPort() {
    $("#serialCloseBtn").click(function() {
        socket.emit("closeSerial");
        $("#serialOpenBtn").prop("disabled",false)
        $("#serialCloseBtn").prop("disabled", true)
    })
}


function sendSerialPort(port){
    socket.emit("openSerial", port);
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

