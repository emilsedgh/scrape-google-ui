var Scraper = require('scrape-google');
var express = require('express');
var app = express();
var csv = require('fast-csv');

app.use(express.static(__dirname + '/public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', newConnection);

function newConnection(sock) {
  sock.on('new scraper', newScraper.bind(null, sock));
}

var scrapers = {};

function newScraper(sock, options) {
  var scraper = Scraper(options);
  var id = (new Date).getTime();
  scrapers[id] = scraper;

  io.sockets.emit('new scraper', id, options);

  scraper.on('estimate pages', function(pages) {
    io.sockets.emit('estimate pages', id, pages);
  });

  scraper.on('fetching page', function(page) {
    io.sockets.emit('fetching page', id, page);
  });

  scraper.on('result', function() {
    io.sockets.emit('result', id);
  });

  scraper.on('end', function() {
    io.sockets.emit('end', id);
  });
}

app.get('/download/:id', function(req, res) {
  var scraper = scrapers[req.params.id];
  if(!scraper) {
    return res.end();
  }

  var results = scraper.results;
  csv.writeToString(results, {
    quoteColumns:true
  }, function(err, data) {
    res.attachment(scraper.options.keyword+'.csv', 'UTF-8');
    res.end(data);
  });
});

http.listen(process.argv[2]);
