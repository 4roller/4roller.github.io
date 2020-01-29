var server = (function(){

    // required
    var WebSocketServer = require('websocket').server;
    var http = require('http');
    var fs = require('fs');

    // connections 
    var clients = [];
    var server;
    var wsServer;

    var image;
    fs.readFile('./images/shot0007.png', function (err,data) {
      if (err) {
        return console.log('err', err);
      }
      image = data;
      //console.log(data);
    });

    var initServer = function() {
        server = http.createServer(function(request, response) {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });
        server.listen(1337, function() {
            console.log((new Date()) + ' Server is listening on port 1337');
        });

        wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: false
        });
    }

    var broadcastMessage = function(msg) {
        console.log('broadcasting message');
        for(var i = 0; i < clients.length; i++) {
            clients[i].sendUTF(msg);
        }
    }

    var removeFromClientList = function(conn) {
        for(var i = 0; i < clients.length; i++) {
            if(clients[i].socket._peername.port ==  conn.socket._peername.port) {
                clients.splice(i, 1);
            }

        }
    }

    var initEvents = function() {
        wsServer.on('request', function(request) {
            var connection = request.accept('echo-protocol', request.origin);
            console.log((new Date()) + ' Connection accepted - ' + request.socket._peername.address + ' ' + request.socket._peername.port );
            clients.push(connection);    
            console.log("Number of connected clients: " + clients.length);
            broadcastMessage("ID-" + request.socket._peername.port + " joined the chat - total users:" + clients.length);

            // Handle an incoming message
            connection.on('message', function(message) {
                console.log('msg type:', message.type);
                if (message.type === 'utf8') {
                    console.log('Received Message: ' + message.utf8Data);
                    broadcastMessage("ID-" + request.socket._peername.port + ": " + message.utf8Data);
                    //connection.sendUTF(message.utf8Data);
                }

                else if (message.type === 'binary') {           
                //     console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');                    
                //     //connection.sendBytes(message.binaryData);
                //     //connection.sendBytes(image);
                } 

                else {
                    console.log('something other than uff8', message.type);
                }

            });

            connection.on('close', function(reasonCode, description) {
                console.log(connection.socket._peername.port);
                removeFromClientList(connection);
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        });       
    }

    return {
        init: function() {
            initServer();
            initEvents();
        }
    }


})();


server.init();










