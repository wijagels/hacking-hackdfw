//var http = require('http');
var plotly = require('plotly')("AvocadosConstant", "5mlhhku3j5")
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/tracker';

var raw;

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  var cursor =db.collection('tracker').find();
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      console.dir(doc);
      raw = doc;
    } else {
      db.close();
    }
  });
});

/*
var trace1 = {
    x: [1, 2, 3, 4],
    y: [10, 15, 13, 17],
      type: "scatter"
};
var trace2 = {
    x: [1, 2, 3, 4],
    y: [16, 5, 11, 9],
      type: "scatter"
};
var data = [trace1, trace2];

var graphOptions = {filename: "get-requests-example", fileopt: "overwrite"};
plotly.plot(data, graphOptions, function (err, msg) {
      console.log(msg);
});
*/

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
