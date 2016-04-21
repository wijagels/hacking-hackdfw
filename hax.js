var fs = require('fs');
var request = require('request');
var Py = require('python-shell');
var debug = require('debug')('dfw-hax');
var async = require('async');
var reqstr = './' + (process.argv[2] || 'user.js');
debug('requiring', reqstr);
var user = require('./' + reqstr);
debug(process.argv);

var headers = {
  referer: 'http//game.hackdfw.com/play/puzzles',
  accept: '*/*',
  authorization: user.authorization,
  'content-type': 'application/json'
};

var submitopts = { method: 'POST',
  url: 'https://hdfw-tehgame.herokuapp.com/puzzle/caesar/' + user.email,
  headers: headers,
  body: '{"answer":"asdf"}'
};

var submitopts_vig = { method: 'POST',
  url: 'https://hdfw-tehgame.herokuapp.com/challenge/vigenere/verify',
  headers: headers,
  body: '{"answer":"asdf"}'
};

var submitopts_play = { method: 'POST',
  url: 'https://hdfw-tehgame.herokuapp.com/challenge/playfair/verify',
  headers: headers,
  body: '{"answer":"asdf"}'
};

var submitopts_morse = { method: 'POST',
  url: 'https://hdfw-tehgame.herokuapp.com/challenge/morse-mp3/verify',
  headers: headers,
  body: '{"answer":"asdf"}'
};

var checkopts = { method: 'GET',
  url: 'https://hdfw-tehgame.herokuapp.com/challenge/caesar',
  headers: headers
};

var checkopts_vig = { method: 'GET',
  url: 'https://hdfw-tehgame.herokuapp.com/challenge/vigenere',
  headers: headers
};

var checkopts_play = { method: 'GET',
  url: 'https://hdfw-tehgame.herokuapp.com/challenge/playfair',
  headers: headers
};

var checkopts_morse = { method: 'GET',
  url: 'https://hdfw-tehgame.herokuapp.com/challenge/morse-mp3',
  headers: headers
};

var decipher = function(body) {
  var pyopts = {
    pythonPath: '/usr/bin/python3',
    scriptPath: 'python',
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

var decipher_vig = function(body) {
  var pyopts = {
    pythonPath: '/usr/bin/python3',
    scriptPath: 'python',
    args: [body.challenge.start]
  };
  Py.run('vigenereCipher.py', pyopts, function(err, results) {
    if(err) return debug(err);
    debug(results);
    submitopts_vig.body = JSON.stringify({'answer': results[0]});
    solve_vig(function(err, results) {
      debug(err, results);
    });
  });
};

var decipher_play = function(body) {
  var pyopts = {
    pythonPath: '/usr/bin/python2',
    scriptPath: 'python',
    args: [body.challenge.start]
  };
  Py.run('play.py', pyopts, function(err, results) {
    if(err) return debug(err);
    debug(results);
    submitopts_play.body = JSON.stringify({'answer': results[0]});
    solve_play(function(err, results) {
      debug(err, results);
    });
  });
};

var decipher_morse = function(body) {
  var pyopts = {
    pythonPath: '/usr/bin/python3',
    scriptPath: 'python',
    args: ['morse_out.txt']
  };
  fs.writeFile('morse_out.txt', body.challenge.start, function(err) {
    if(err) {
      return debug(err);
    }
    Py.run('morse.py', pyopts, function(err, results) {
      if(err) return debug(err);
      debug(results);
      submitopts_morse.body = JSON.stringify({'answer': results[0]});
      solve_morse(function(err, results) {
        debug(err, results);
      });
    });
  });
};

var attack = function(callback) {
  var lock = true;
  for(var i=0;i < 1;i++) {
    request(submitopts, function (error, response, body) {
      if (error) return debug(error);
      try {
        body = JSON.parse(body);
      } catch(e) {
        return debug('Bad server reply');
      } if(body.result === false) {
        if(lock) {
          lock = false;
          return callback(null, [submitopts.body, false]);
        }
      } else {
        if(lock) {
          lock = false;
          return callback('Done', body);
        }
      }
    });
  }
};

var solve_vig = function(callback) {
  request(submitopts_vig, function (error, response, body) {
    if (error) return debug(error);
    try {
      body = JSON.parse(body);
    } catch(e) {
      return debug('Bad server reply');
    } if(body.result === false) {
      return callback(null, [submitopts_vig.body, false]);
    } else {
      return callback('Done', body);
    }
  });
};

var solve_play = function(callback) {
  request(submitopts_play, function (error, response, body) {
    if (error) return debug(error);
    try {
      body = JSON.parse(body);
    } catch(e) {
      return debug('Bad server reply');
    } if(body.result === false) {
      return callback(null, [submitopts_play.body, false]);
    } else {
      return callback('Done', body);
    }
  });
};

var solve_morse = function(callback) {
  request(submitopts_morse, function (error, response, body) {
    if (error) return debug(error);
    try {
      body = JSON.parse(body);
    } catch(e) {
      return debug('Bad server reply');
    } if(body.result === false) {
      return callback(null, [submitopts_morse.body, false]);
    } else {
      return callback('Done', body);
    }
  });
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
      debug('Attempting decryption and attack!');
      decipher(body);
    } else {debug(body['error']);}
  });
  request(checkopts_vig, function(err, res, body) {
    try {
      body = JSON.parse(body);
    } catch(e) {
      debug('Server appears to be fucked...');
      return;
    }
    if(body['status'] === 'success') {
      debug('Attempting decryption and attack!');
      decipher_vig(body);
    } else {debug(body['error']);}
  });
  request(checkopts_play, function(err, res, body) {
    try {
      body = JSON.parse(body);
    } catch(e) {
      debug('Server appears to be fucked...');
      return;
    }
    if(body['status'] === 'success') {
      debug('Attempting decryption and attack!');
      decipher_play(body);
    } else {debug(body['error']);}
  });
  request(checkopts_morse, function(err, res, body) {
    try {
      body = JSON.parse(body);
    } catch(e) {
      debug('Server appears to be fucked...');
      return;
    }
    if(body['status'] === 'success') {
      debug('Attempting decryption and attack!');
      decipher_morse(body);
    } else {debug(body['error']);}
  });
};
setInterval(check, 10000);
