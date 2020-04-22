var http = require('http');
var fs = require('fs');
var util = require('util');
var child_process = require('child_process');
var exec = child_process.exec;

var random1 = '';
var random2 = '';

var wget_attempts = 0;
var http_attempts = 0;

var savepath = './wallpapers/'
var log_file = fs.createWriteStream("./debug.log", {flags : 'w'});

function callback(response) {
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  var end_func = function () {
    try {
      var files = fs.readdirSync('D:/GitHub/random_wallpaper/wallpapers/');
      files.forEach(function(f) {
        fs.unlink('D:/GitHub/random_wallpaper/wallpapers/' + f)
      });
      var raw_urls = str.match(/imgurl=.+?&/g);
      var clean_urls = raw_urls.map(function(url) {
        return url.substring(7, url.length - 1);
      });
      var urls = clean_urls.map(decodeURIComponent);
      //var randPick = Math.floor((urls.length - 1) * Math.random());
      var url = urls[0];
      var cmd = "D:/Program Files/GnuWin32/bin/wget.exe";
      var img_file = "D:/GitHub/random_wallpaper/wallpapers/" + random1 + "-" + random2 + ".jpg";
      var args = ['-O', img_file, url];
      child_process.execFileSync(cmd, args, {encoding: 'utf8' });
      var log_print = random1 + ' ' + random2 + ': ' + url + '\n';
      log_file.write(util.format(log_print));      
      wget_attempts = 0;
      http_attempts = 0;     
    } catch (err) {
      console.log(err, "Error recieved");
      log_file.write(util.format(err) + '\n');
      wget_attempts += 1;
      if (wget_attempts < 3) {
        foo();
      };
    };
  }

  response.on('end', end_func);
}

function randomWord() {
  var index = Math.floor(Math.random() * 20000);
  var cmd = "D:/Program Files/GnuWin32/bin/sed.exe";
  var args = [index + 'q;d', './words.txt'];
  var dirty_word = child_process.execFileSync(cmd, args, { encoding: 'utf8' });
  var word = dirty_word.trim();
  console.log(word);
  return word;
}

function convertImg() {
  var args = 'convert ./wallpapers/' + random1 + '-' + random2 + '.jpg -pointsize 25 -gravity south -stroke "#000C" -strokewidth 4 -annotate 0 "' + random1 + ' ' + random2 + '" -stroke none -fill white -annotate 0 "' + random1 + ' ' + random2 + '" ./wallpapers/' + random1 + "-" + random2 + ".jpg";
  child_process.execSync(args);
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
    log_file.write(util.format(err) + '\n');
    http_attempts += 1;
    if (http_attempts < 3) {
      foo();
    }
  });
  request.end();
}

// setInterval(function() {
//   foo();
//   setTimeout(convertImg,5000);
// }, 10000);

setInterval(function() {
  foo();
  setTimeout(convertImg,5000);
}, 1800000);
