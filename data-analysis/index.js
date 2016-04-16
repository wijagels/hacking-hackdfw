//var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/tracker';
var fs = require('fs');
var reqstr = './' + (process.argv[2] || 'user.js');
var user = require('./' + reqstr);
var plotly = require('plotly')(user.user, user.apikey)

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return time = (a.getMonth()+1) + '/' + a.getDate()+ ', ' + a.getHours() + ':' + a.getMinutes();
}

var obj = JSON.parse(fs.readFileSync('./tracker1141.json', 'utf8'));

//  Selected list of assorted strong players
var vips = [
  'PARKJS814',
  'JACOB DORPINGHAUS',
  'THUNG1', 
  'WJAGELS1',
  'BRIAN_CHUK',
  'THOMASVAGNING',
  'HACKDFW-SP16',
  'ANDIEBIGGS14',
  'PUYAGHARAHI',
  'JAKE WILKERSON',
  'JESSICA ALBARIAN', 
  'UMARTINEZPARADA'
]
console.log('\tProjected time until VIP package can be purchased.\n');

//  Guessing how much players have spent on purchases
var vipsSpending = [
    0,      //  park
    0,      //  dorp
    1220,   //  tim
    1000,   //  will
    0,      //  brian
    0,0,0,0,0,0,0,0,0,0     //  don't matter, too far behind
]

var plotData = [];
var entries = obj.everything;

var numOfEntries = entries.length;

var times = []; //  for x axis of graph
for(var entryIndex = 1; entryIndex < numOfEntries; entryIndex++) {
  times.push(timeConverter(entries[entryIndex].time));
}

//  cycle through all vips to grab their info
for(var focusIndex in vips) {       
  var focus = vips[focusIndex];         //  current vip to focus on
  var focusScores = [];                 //  focus' scores per entry
  var focusGains = [];                  //  focus' gains per entry

  for(var entryIndex = 1; entryIndex < numOfEntries; entryIndex++) {
    var foundCheck = false;
    var entryLeaderboard = entries[entryIndex].leaderboard;
    times.push(timeConverter(entries[entryIndex].time));
    for(var playerIndex in entryLeaderboard) {
      var player = entryLeaderboard[playerIndex];
      if(Object.keys(player)[0] == focus) {
        foundCheck = true;
        focusScores.push(player[focus]);
      }
    }
    if(entryIndex > 1) focusGains.push(focusScores[entryIndex-1] - focusScores[entryIndex-2]);

    //  if this player isn't listed
    if(!foundCheck) {
        focusScores.push(focusScores[focusScores.length - 1]);
        focusGains.push(0);
    }
  }
  
  var scope = 12;                                           //  number of recent entries to analyze
  var curScore = focusScores[focusScores.length - 1];       //  player's current score
  var ptsTil10k = 10000-curScore+vipsSpending[focusIndex];  //  how many points the player needs until 10k

  var sum = 0;              //  sum for calculating average gain
  for(var i = focusGains.length - scope; i < focusGains.length; i++) {sum += focusGains[i];}
  var avgGain = sum/scope;  //  average gain every 30 min

  var outString = '';
  outString += focus;
  for(var i = 0; i < (3 - Math.floor(focus.length/8)); i++) outString += '\t';
  outString += 'total gain/'+ scope/2 +' hours = ' + sum;
  outString += '\taverage gain/30 min = ' + avgGain.toFixed(2);
  outString += '\tpts til 10k = ' + ptsTil10k; 
  outString += '\thours til 10k = ' + (ptsTil10k / (2 * avgGain)).toFixed(2); 
  console.log(outString);

  //    append user data to plot
  plotData.push({
    type: 'scatter',
    x: times,
    y: focusScores,
    mode: 'lines',
    name: focus,
    line: {
      width: 3
    }
  });
}

//  new line who dis
console.log();

//  plot the data!
var layout = {
  title: "HackDFW Game Tracking",
  xaxis: {
    title: "Time",
    titlefont: {
      family: "Courier New, monospace",
      size: 18,
      color: "#7f7f7f"
    }
  },
  yaxis: {
    title: "Points",
    titlefont: {
      family: "Courier New, monospace",
      size: 18,
      color: "#7f7f7f"
    }
  }
};
var graphOptions = {layout: layout, filename: "hackdfw-tracker", fileopt: "overwrite"};
plotly.plot(plotData, graphOptions, function (err, msg) {
    if (err) return console.log(err);
        console.log(msg);
});












/*
//Lets define a port we want to listen to
const PORT=8080; 

//We need a function which handles requests and send response
function handleRequest(request, response){
  response.end('It Works!! Path Hit: ' + request.url);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
  //Callback triggered when server is successfully listening. Hurray!
  console.log("Server listening on: http://localhost:%s", PORT);
});
*/
