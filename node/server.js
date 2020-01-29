
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , Deck = require('./deck')


app.listen(8090);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',

  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {

   var deck1 = new Deck();
   deck1.shuffle();

   var userHand = [];
   var player1 = [];
   var player2 = [];
   var player3 = []; 

   for(var i = 0; i < 13; i++) {
      userHand.push(deck1.dealCard());
      player1.push(deck1.dealCard());
      player2.push(deck1.dealCard());
      player3.push(deck1.dealCard());
   }


  // socket.emit to transmit an event to browser
  socket.emit('big2Start', { card: userHand });
  

  // socket.on to listen for a browser event
  socket.on('my other event', function (data) {
    console.log(data);
  });
  

});