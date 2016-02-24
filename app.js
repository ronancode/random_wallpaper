var http = require('http');
var child_process = require('child_process');
var exec = child_process.exec;

var img_file = "/tmp/script-wallpaper.jpg";

function callback(response) {
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    try {
      var raw_urls = str.match(/imgurl=.+?&/g);
      var clean_urls = raw_urls.map(function(url) {
        return url.substring(7, url.length - 1);
      });
      var urls = clean_urls.map(decodeURIComponent);
      var randPick = Math.floor((urls.length - 1) * Math.random());
      var url = urls[randPick];
      child_process.execSync('curl ' + url + ' > ' + img_file);
      child_process.execSync('gsettings set org.cinnamon.desktop.background picture-uri "file://' + img_file + '"');
    } catch (e) {
      console.log('whoops ', e);
    }
  });
}

function randomWord() {
  var index = Math.floor(Math.random() * 19000);
  var cmd = 'sed "' + index + 'q;d" words.txt';
  var dirty_word = child_process.execSync(cmd, { encoding: 'utf8' });
  var word = dirty_word.trim()
  console.log(word);
  return word;
}

child_process.execSync("gsettings set org.gnome.desktop.background picture-options 'centered'");

setInterval(function() {
  var host = 'images.search.yahoo.com';
  var path = '/search/images?p=' + randomWord() + '+' + randomWord();
  var options = {};
  options.host = host;
  options.path = path;
  http.request(options, callback).end();
}, 20000)
