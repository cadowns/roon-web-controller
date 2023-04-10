"use strict";
var socket = io();
let currInput;

$(document).ready(function() {
  $("#buttonMenuRight").html(getSVG("menu"));
  $("#buttonMenuLeft").html(getSVG("refresh"));

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
      $("#nowPlayingButton").show();
      $("#libraryButton").show();
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
      $("#buttonMenuLeft").show();
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
      $("#buttonMenuLeft").hide();
      break;
    case "inputsInfo":
      $("#buttonMenu").show();
      $("#inputInfo").show();

      $("#libraryBrowser").hide();
      $("#nowPlaying").hide();
      $("#pageLoading").hide();
      $("#overlayMainMenu").hide();
      $("#buttonMenuLeft").show();
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
      $("#buttonMenuLeft").show();
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
    case "refresh":
      return '<svg width="800" height="800" viewBox="0 0 1024 1024" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M643.759 876.884c77.46-26.672 141.075-75.755 185.988-137.307a19.72 19.72 0 0 0 5.693-17.36 19.44 19.44 0 0 0-.088-.589l-.01-.049a19.667 19.667 0 0 0-10.709-14.159l-56.53-40.088a19.77 19.77 0 0 0-17.265-5.427c-.155.02-.31.042-.464.066l-.072.019a19.825 19.825 0 0 0-14.149 10.532c-31.44 42.857-75.609 76.947-129.836 95.619-140.801 48.482-293.643-25.746-341.963-166.079s26.422-292.924 167.222-341.406c131.991-45.448 273.616 14.979 330.786 138.05l-89.429.558c-8.995-1.174-17.65 3.91-20.99 12.331a19.656 19.656 0 0 0 6.332 23.117l153.694 155.17c3.812 3.848 9.047 5.96 14.475 5.84s10.574-2.461 14.228-6.475l148.171-162.749c6.482-5.349 8.872-14.193 5.961-22.048-.05-.132-.102-.264-.156-.394a19.374 19.374 0 0 0-1.228-2.599l-.04-.09c-4.015-7.084-11.99-10.968-20.072-9.775l-89.491.945-1.173-3.406c-68.86-199.985-287.86-306.346-488.523-237.252S86.366 439.616 155.226 639.601c68.86 199.985 287.86 306.345 488.523 237.251l.011.033z"/></svg>'
    default:
      break;
  }
}
