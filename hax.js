var request = require('request');
var Py = require('python-shell');
var debug = require('debug')('dfw-hax');
var async = require('async');

var headers = {
  referer: 'http//game.hackdfw.com/play/puzzles',
  dnt: '1',
  accept: '*/*',
  authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTE4LCJlbWFpbCI6IndqYWdlbHMxQGJpbmdoYW10b24uZWR1Iiwicm9sZSI6ImhhY2tlciIsImlhdCI6MTQ2MDI0MzA3MywiZXhwIjoxNDYwMjU3NDczfQ.EepBMRdWtkVzJ5LxqD643MQYktEYCPNpEbx81WjA9RU',
  // origin: 'http//game.hackdfw.com',
  // 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36',
  'content-type': 'application/json'
};

var submitopts = { method: 'POST',
  url: 'https://hdfw-tehgame.herokuapp.com/puzzle/caesar/wjagels1@binghamton.edu',
  headers: headers,
  body: '{"answer":"asdf"}'
};

var checkopts = { method: 'GET',
  url: 'https://hdfw-tehgame.herokuapp.com/challenge/caesar',
  headers: headers
};

var decipher = function(body) {
  var pyopts = {
    pythonPath: '/usr/bin/python2',
    args: [body.challenge.start]
  };
  Py.run('cs.py', pyopts, function(err, results) {
    if(err) return debug(err);
    debug(results);
    async.mapLimit(results, 1, function(item, callback) {
      debug('start new');
      submitopts.body = JSON.stringify({'answer': item});
      attack(callback);
    }, function(err, results) {
      debug(err, results);
    });
  });
};

var attack = function(callback) {
  var done = true;
  for(var i=0;i < 20;i++) {
    // console.log('fired %s', submitopts.body);
    request(submitopts, function (error, response, body) {
      if (error) return debug(error);
      try {
        body = JSON.parse(body);
      } catch(e) {
        return debug('Bad server reply');
      } if(body.status === 'error') {
        if(done) {
          done = false;
          return callback(null, [submitopts.body, false]);
        }
      } else {
        timer = setInterval(check, 5000);
        if(done) {
          done = false;
          return callback('Done', body);
        }
      }
      // debug(body);
    });
  }
};

var check = function() {
  request(checkopts, function(err, res, body) {
    try {
      body = JSON.parse(body);
    } catch(e) {
      debug('Server appears to be fucked');
      return;
    }
    if(body['status'] === 'success') {
      debug('READY TO GO!');
      clearInterval(timer);
      decipher(body);
    }
  });
};
var timer = setInterval(check, 5000);