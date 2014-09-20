var Scraper = require('../google-scraper');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', newConnection);

function newConnection(sock) {
  sock.on('scrape', newScraper.bind(null, sock));
}

function newScraper(sock, options) {
  var scraper = Scraper(options);

  scraper.on('estimate pages', function(pages) {
    sock.emit('estimate pages', pages);
  });
}

http.listen(process.argv[2]);