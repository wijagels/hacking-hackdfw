var request = require('request');
var debug = require('debug')('dfw-tracker');
var async = require('async');

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
    } else {debug(body['error']);}
  });
};
//var timer = setInterval(check, 10000);
check();
