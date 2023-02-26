"use strict";
// Setup general variables
var defaultListenPort = 8080;

var core, transport;
var pairStatus = 0;
var zoneStatus = [];
var zoneList = [];

let serial,serialParser;
let coreIP;

var serialPortStatus = false;

// Change to working directory
try {
  process.chdir(__dirname);
  console.log(`Working directory: ${process.cwd()}`);
} catch (err) {
  console.error(`chdir: ${err}`);
}

// Read command line options
var commandLineArgs = require("command-line-args");
var getUsage = require("command-line-usage");
var util = require('util');

var optionDefinitions = [
  {
    name: "help",
    alias: "h",
    description: "Display this usage guide.",
    type: Boolean
  },
  {
    name: "port",
    alias: "p",
    description: "Specify the port the server listens on.",
    type: Number
  }
];

var options = commandLineArgs(optionDefinitions, { partial: true });

var usage = getUsage([
  {
    header: "Roon Web Controller",
    content:
      "A web based controller for the Roon Music Player.\n\nUsage: {bold node app.js <options>}"
  },
  {
    header: "Options",
    optionList: optionDefinitions
  },
  {
    content:
      "Project home: {underline https://github.com/pluggemi/roon-web-controller}"
  }
]);

if (options.help) {
  console.log(usage);
  process.exit();
}

// Read config file
var config = require("config");

var configPort = config.get("server.port");

// Determine listen port
if (options.port) {
  var listenPort = options.port;
} else if (configPort) {
  var listenPort = configPort;
} else {
  var listenPort = defaultListenPort;
}
// Setup Express
var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var {SerialPort, ReadlineParser} = require("serialport");









var app = express();
app.use(express.static("public"));
app.use(bodyParser.json());



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Setup Socket IO
var server = http.createServer(app);
var io = require("socket.io").listen(server);

server.listen(listenPort, function() {
  console.log("Listening on port " + listenPort);
});

// Setup Roon
var RoonApi = require("node-roon-api");
var RoonApiImage = require("node-roon-api-image");
var RoonApiStatus = require("node-roon-api-status");
var RoonApiTransport = require("node-roon-api-transport");
var RoonApiBrowse = require("node-roon-api-browse");

var roon = new RoonApi({
  extension_id: "com.pluggemi.web.controller",
  display_name: "Web Controller",
  display_version: "1.2.13",
  publisher: "Mike Plugge",
  // log_level: "none",
  email: "masked",
  website: "https://github.com/pluggemi/roon-web-controller",

  core_paired: function(core_) {
    core = core_;
    coreIP = core.moo.transport.ws.url;
    coreIP = coreIP.substring(5);
    console.log("Core network info: " + coreIP);


    pairStatus = true;
    io.emit("pairStatus", JSON.parse('{"pairEnabled": ' + pairStatus + "}"));
    io.emit("coreInfo", coreIP);

    transport = core_.services.RoonApiTransport;

    transport.subscribe_zones(function(response, data) {
      var i, x, y, zone_id, display_name;
      if (response == "Subscribed") {
        for (x in data.zones) {
          zone_id = data.zones[x].zone_id;
          display_name = data.zones[x].display_name;
          var item = {};
          item.zone_id = zone_id;
          item.display_name = display_name;
          item.disp_name_b64 = escape(display_name);

          zoneList.push(item);
          console.log(item);
          zoneStatus.push(data.zones[x]);
        }

        removeDuplicateList(zoneList, "zone_id");
        removeDuplicateStatus(zoneStatus, "zone_id");
      } else if (response == "Changed") {
        for (i in data) {
          if (i == "zones_changed" || i == "zones_seek_changed") {
            for (x in data.zones_changed) {
              for (y in zoneStatus) {
                if (zoneStatus[y].zone_id == data.zones_changed[x].zone_id) {
                  zoneStatus[y] = data.zones_changed[x];
                }
              }
            }
            io.emit("zoneStatus", zoneStatus);
          } else if (i == "zones_added") {
            for (x in data.zones_added) {
              zone_id = data.zones_added[x].zone_id;
              display_name = data.zones_added[x].display_name;

              item = {};
              item.zone_id = zone_id;
              item.display_name = display_name;

              zoneList.push(item);
              zoneStatus.push(data.zones_added[x]);
            }

            removeDuplicateList(zoneList, "zone_id");
            removeDuplicateStatus(zoneStatus, "zone_id");
          } else if (i == "zones_removed") {
            for (x in data.zones_removed) {
              zoneList = zoneList.filter(function(zone) {
                return zone.zone_id != data.zones_removed[x];
              });
              zoneStatus = zoneStatus.filter(function(zone) {
                return zone.zone_id != data.zones_removed[x];
              });
            }
            removeDuplicateList(zoneList, "zone_id");
            removeDuplicateStatus(zoneStatus, "zone_id");
          }
        }
      }
    });
  },

  core_unpaired: function(core_) {
    pairStatus = false;
    io.emit("pairStatus", JSON.parse('{"pairEnabled": ' + pairStatus + "}"));
  }
});

var svc_status = new RoonApiStatus(roon);

roon.init_services({
  required_services: [RoonApiTransport, RoonApiImage, RoonApiBrowse],
  provided_services: [svc_status]
});

svc_status.set_status("Extension enabled", false);

roon.start_discovery();



// Remove duplicates from zoneList array
function removeDuplicateList(array, property) {
  var x;
  var new_array = [];
  var lookup = {};
  for (x in array) {
    lookup[array[x][property]] = array[x];
  }

  for (x in lookup) {
    new_array.push(lookup[x]);
  }

  zoneList = new_array;
  io.emit("zoneList", zoneList);
}

// Remove duplicates from zoneStatus array
function removeDuplicateStatus(array, property) {
  var x;
  var new_array = [];
  var lookup = {};
  for (x in array) {
    lookup[array[x][property]] = array[x];
  }

  for (x in lookup) {
    new_array.push(lookup[x]);
  }

  zoneStatus = new_array;
  io.emit("zoneStatus", zoneStatus);
}

function refresh_browse(zone_id, options, callback) {
  options = Object.assign(
    {
      hierarchy: "browse",
      zone_or_output_id: zone_id
    },
    options
  );

  core.services.RoonApiBrowse.browse(options, function(error, payload) {
    if (error) {
      console.log(error, payload);
      return;
    }

    if (payload.action == "list") {
      var items = [];
      if (payload.list.display_offset > 0) {
        var listoffset = payload.list.display_offset;
      } else {
        var listoffset = 0;
      }
      core.services.RoonApiBrowse.load(
        {
          hierarchy: "browse",
          offset: listoffset,
          set_display_offset: listoffset
        },
        function(error, payload) {
          callback(payload);
        }
      );
    }
  });
}

function load_browse(listoffset, callback) {
  core.services.RoonApiBrowse.load(
    {
      hierarchy: "browse",
      offset: listoffset,
      set_display_offset: listoffset
    },
    function(error, payload) {
      callback(payload);
    }
  );
}

let currInput = "Raspberry Pi";
let currInputSerial = '!';
let portList = [];
let friendlyPortList = [];
let serialStatus = "Closed";

//let serial = new SerialPort({path: 'COM5', baudRate: 115200});
//let serialParser = serial.pipe(new ReadlineParser({delimiter: '\n'}));
//serialParser.on('data', readSerialData);



// ---------------------------- SERIAL STUFF -----------------


function readSerialData(data){
  switch (data) {
    case "RPi":
      currInput = "Raspberry Pi";
      currInputSerial = '!';
      break;
    case "OPT":
      currInput = "Optical";
      currInputSerial = '@';
      break;
    case "RCA":
      currInput = "RCA";
      currInputSerial = '#';
      break;
    case "HDMI":
      currInput = "HDMI";
      currInputSerial = '$';
      break;
    case "USB":
      currInput = "USB";
      currInputSerial = '%';
      break;
     default:
       console.log("default case hit in readSerialData");
  }
  console.log("input changed to " + currInput + " by touchscreen");
  io.emit("currInputUpdate", currInput);
}

function writeSerial(data){
  try {
    serial.write(data);
  } catch (e) {
    console.log("serial port not open yet");
  }

}
function list(ports){
  ports.forEach((port) => {
    portList.push(port.path);
    if (port.friendlyName == null){
      friendlyPortList.push(port.path);
    } else {
      friendlyPortList.push(port.friendlyName);
    }

  });
  console.log(portList);
  console.log(friendlyPortList)
}

SerialPort.list().then(list, err => {
  process.exit(1);
})


writeSerial('!');
console.log(portList);





// ---------------------------- WEB SOCKET --------------
io.on("connection", function(socket) {
  io.emit("pairStatus", JSON.parse('{"pairEnabled": ' + pairStatus + "}"));
  io.emit("coreInfo", coreIP);
  io.emit("zoneList", zoneList);
  io.emit("zoneStatus", zoneStatus);
  io.emit("currInputUpdate", currInput);
  io.emit("availSerialPorts", portList, friendlyPortList);
  io.emit("serialStatus", serialStatus);
  console.log("CURRENT INPUT: " + currInput)

  socket.on("openSerial", function(newPort, newBaud) {
    try {
      console.log("trying to open new port: " + newPort + " at " + newBaud);
      serial = new SerialPort({path: newPort.toString(), baudRate: parseInt(newBaud)});
      serialParser = serial.pipe(new ReadlineParser({delimiter: '\n'}));
      serialParser.on('data', readSerialData);
      serialStatus = newPort + " Open";
      io.emit("serialStatus", serialStatus)
      console.log(newPort + " open");
    } catch (e) {
      console.log("failed to open port");
    }

    });

  socket.on("closeSerial", function(port)  {
    try {
      serial.close();
      console.log("closed port");
      serialStatus = "Closed"
      io.emit("serialStatus", serialStatus)
    } catch (e) {
      console.log("unable to close port: " + e);
    }


  })


  socket.on("getZone", function() {
    io.emit("zoneStatus", zoneStatus);
  });

  socket.on("getInput", function() {
    io.emit("currInputUpdate", currInput);
  })

  socket.on("changeInput", function(msg){
    switch (msg) {
      case '!':
        currInput = "Raspberry Pi";
        currInputSerial = msg;
        break;
      case '@':
        currInput = "Optical";
        currInputSerial = msg;
        break;
      case '#':
        currInput = "RCA";
        currInputSerial = msg;
        break;
      case '$':
        currInput = "HDMI";
        currInputSerial = msg;
        break;
      case '%':
        currInput = "USB";
        currInputSerial = msg;
        break;
      default:
        console.log("default case hit in changeInput");
    }
    console.log("input changed to " + currInput + " by web");
    io.emit("currInputUpdate", currInput);
    writeSerial(currInputSerial);

  })

  socket.on("changeVolume", function(msg) {
    transport.change_volume(msg.output_id, "absolute", msg.volume);
  });

  socket.on("changeSetting", function(msg) {
    var settings = [];

    if (msg.setting == "shuffle") {
      settings.shuffle = msg.value;
    } else if (msg.setting == "auto_radio") {
      settings.auto_radio = msg.value;
    } else if (msg.setting == "loop") {
      settings.loop = msg.value;
    }

    transport.change_settings(msg.zone_id, settings, function(error) {});
  });

  socket.on("goPrev", function(msg) {
    transport.control(msg, "previous");
  });

  socket.on("goNext", function(msg) {
    transport.control(msg, "next");
  });

  socket.on("goPlayPause", function(msg) {
    transport.control(msg, "playpause");
  });

  socket.on("goPlay", function(msg) {
    transport.control(msg, "play");
  });

  socket.on("goPause", function(msg) {
    transport.control(msg, "pause");
  });

  socket.on("goStop", function(msg) {
    transport.control(msg, "stop");
  });


});

// Web Routes
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/fullscreen.html");
});

app.get("/roonapi/getImage", function(req, res) {
  core.services.RoonApiImage.get_image(
      req.query.image_key,
    { scale: "fit", width: 1080, height: 1080,
      format: "image/jpeg" },
    function(cb, contentType, body) {
      res.set('Content-Type','image/jpeg');
      res.status(200).send(body);
    }
  );
});

app.get("/roonapi/getImage4k", function(req, res) {
  core.services.RoonApiImage.get_image(
    req.query.image_key,
    { scale: "fit", width: 2160, height: 2160, format: "image/jpeg" },
    function(cb, contentType, body) {
      res.contentType = contentType;

      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(body, "binary");
    }
  );
});

app.post("/roonapi/goRefreshBrowse", function(req, res) {
  refresh_browse(req.body.zone_id, req.body.options, function(payload) {
    res.send({ data: payload });
  });
});

app.post("/roonapi/goLoadBrowse", function(req, res) {
  load_browse(req.body.listoffset, function(payload) {
    res.send({ data: payload });
  });
});

app.use(
  "/jquery/jquery.min.js",
  express.static(__dirname + "/node_modules/jquery/dist/jquery.min.js")
);

app.use(
  "/js-cookie/js.cookie.js",
  express.static(__dirname + "/node_modules/js-cookie/src/js.cookie.js")
);


