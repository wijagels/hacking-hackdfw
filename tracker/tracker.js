var request = require('request');
var debug = require('debug')('dfw-tracker');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/tracker';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db.close();
});

var insertDocument = function(db, json, callback) {
    //console.log(json);
    db.collection('tracker').insertOne(json, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the tracker collection.");
        callback();
    });
};






var headers = {
  referer: 'http://game.hackdfw.com/login',
  accept: '*/*',
  'content-type': 'application/json'
};

var checkopts = { method: 'GET',
  url: 'https://hdfw-tehgame.herokuapp.com/leaderboard',
  headers: headers
};

var check = function() {
  request(checkopts, function(err, res, body) {
    try {
      body = JSON.parse(body);
    } catch(e) {
      debug('Server appears to be fucked...');
      return;
    }
    if(body['status'] === 'success') {
      debug('Server online');
      //clearInterval(timer);
      debug(body);

      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        insertDocument(db, body, function() {
        db.close();
        });
      });
    
    } else {debug(body['error']);}
  });
};
//var timer = setInterval(check, 10000);
check();
