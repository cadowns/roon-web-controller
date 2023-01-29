"use strict";
var socket = io();
let currInput;

$(document).ready(function() {
  $("#buttonMenu").html(getSVG("menu"));

  socket.on("pairStatus", function(payload) {
    var pairEnabled = payload.pairEnabled;

    if (pairEnabled === true) {
      showSection("nowPlaying");
    } else {
      showSection("pairDisabled");
    }
  });

  socket.on("currInputUpdate", function(payload) {
    currInput = payload;
    if (currInput != "Raspberry Pi") {
      $("#nowPlayingButton").hide();
      $("#libraryButton").hide();
    } else {
      $("#nowPlayingButton").show();
      $("#libraryButton").show();
    }
  });

});

function showSection(sectionName) {
  switch (sectionName) {
    case "nowPlaying":
      $("#buttonMenu").show();
      // Show Now Playing screen
      $("#nowPlaying").show();
      // Hide inactive sections
      $("#pairDisabled").hide();
      $("#libraryBrowser").hide();
      $("#overlayMainMenu").hide();
      $("#inputInfo").hide();
      break;
    case "libraryBrowser":
      $("#buttonMenu").show();
      // Show libraryBrowser
      $("#libraryBrowser").show();
      // Hide inactive sections
      $("#pairDisabled").hide();
      $("#nowPlaying").hide();
      $("#overlayMainMenu").hide();
      $("#inputInfo").hide();
      break;
    case "inputsInfo":
      $("#buttonMenu").show();
      $("#inputInfo").show();

      $("#libraryBrowser").hide();
      $("#nowPlaying").hide();
      $("#pageLoading").hide();
      $("#overlayMainMenu").hide();
      break;
    case "pairDisabled":
      // Show pairDisabled section
      $("#pairDisabled").show();
      // Hide everthing else
      $("#buttonMenu").hide();
      $("#libraryBrowser").hide();
      $("#nowPlaying").hide();
      $("#pageLoading").hide();
      $("#inputInfo").hide();
      break;

    default:
      break;
  }
  var t = setTimeout(function() {
    $("#pageLoading").hide();
  }, 250);
}

function getSVG(cmd) {
  switch (cmd) {
    case "menu":
      return '<svg viewBox="0 0 512 512"><path d="M64 128h384v42.667H64V128m0 106.667h384v42.666H64v-42.666m0 106.666h384V384H64v-42.667z"/></svg>';
    default:
      break;
  }
}
