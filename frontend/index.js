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
  //console.log(UNIX_timestamp);
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  //  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = month + ' ' + date + ', ' + hour + ':' + min + ':' + sec ;
  return time;
}

var obj = JSON.parse(fs.readFileSync('./tracker0710.json', 'utf8'));

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

for(var focusIndex in vips) {
  var focus = vips[focusIndex];
  var focusScores = [];
  var focusGains = [];
  var numOfEntries = entries.length;
  var times = [];

  for(var entryIndex = 1; entryIndex < numOfEntries; entryIndex++) {
    var foundCheck = false;
    times.push(timeConverter(entries[entryIndex].time));

  for(var entryIndex = 1; entryIndex < numOfEntries; entryIndex++) {
    var foundCheck = false;
    for(var playerIndex in entries[entryIndex].leaderboard) {
      var player = entries[entryIndex].leaderboard[playerIndex];
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
  
  var scope = 4;                                            //  number of recent entries to analyze
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
    //x: times,

    x: Object.keys(focusScores),
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
  fileopt : "overwrite", 
  filename : "mongo-tracker"
};
plotly.plot(plotData, layout, function (err, msg) {
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
