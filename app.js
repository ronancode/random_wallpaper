var http = require('http');
var fs = require('fs');
var child_process = require('child_process');
var exec = child_process.exec;

var random1 = '';
var random2 = '';

var wget_attempts = 0;
var http_attempts = 0;


function callback(response) {
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  var end_func = function () {
    try {
      var files = fs.readdirSync('C:/Users/Ronan Rice/Documents/Wallpapers/')
      files.forEach(function(f) {
        fs.unlink('C:/Users/Ronan Rice/Documents/Wallpapers/' + f)
      });
      var raw_urls = str.match(/imgurl=.+?&/g);
      var clean_urls = raw_urls.map(function(url) {
        return url.substring(7, url.length - 1);
      });
      var urls = clean_urls.map(decodeURIComponent);
      //var randPick = Math.floor((urls.length - 1) * Math.random());
      var url = urls[0];
      var cmd = "C:/Program Files (x86)/GnuWin32/bin/wget.exe";
      var img_file = "C:/Users/Ronan Rice/Documents/Wallpapers/" + random1 + "-" + random2 + ".jpg";
//      var img_file = "C:/Users/Ronan Rice/Documents/Wallpapers/" + random1 + ".jpg";
      var args = ['-O', img_file, url];
      child_process.execFileSync(cmd, args, {encoding: 'utf8' });
      wget_attempts = 0;
      http_attempts = 0;     
    } catch (err) {
      console.log(err, "sdfsdf");
      wget_attempts += 1;
      if (wget_attempts < 3) {
        foo();
      };
    };
  }

  response.on('end', end_func);
}

function randomWord() {
  var index = Math.floor(Math.random() * 19000);
  var cmd = "C:/Program Files (x86)/GnuWin32/bin/sed.exe";
  var args = [index + 'q;d', './words.txt'];
  var dirty_word = child_process.execFileSync(cmd, args, { encoding: 'utf8' });
  var word = dirty_word.trim();
  console.log(word);
  return word;
}

function foo() {
  var host = 'images.search.yahoo.com';
  random1 = randomWord();
  random2 = randomWord();
  var path = '/search/images?p=' + random1 + '+' + random2 + '&imgsz=large';
  var options = {};
  options.host = host;
  options.path = path;
  var request = http.request(options, callback)
  request.on('error', function(err) {
    console.log(err);
    http_attempts += 1;
    if (http_attempts < 3) {
      foo();
    }
  });
  request.end();
}

setInterval(function() {
  foo();
}, 60000);
