var request = require('request');
var debug = require('debug')('dfw-tracker');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/tracker';

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  debug('Connected correctly to server.');
  db.close();
});

var insertDocument = function(db, json, callback) {
  db.collection('tracker').insertOne(json, function(err, result) {
    assert.equal(err, null);
    debug('Inserted a document into the tracker collection.', result);
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

      var json = {};
      json.time = Date.now();
      json.leaderboard = body.leaderboard;
      debug(json);

      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        insertDocument(db, json, function() {
          db.close();
        });
      });
    } else {debug(body['error']);}
  });
};

check();
setInterval(check, 30*60*1000);
