var mongoTestService = (function() {

	// Requrires
	var fs = require('fs');
	var http = require('http');
	var url = require('url') ;
	var request = require('request');
	var xml2js = require('xml2js').parseString;
	var Promise = require('promise');
	var mongodb = require('mongodb');
	var SERVER_PORT = 3334;  

	var MongoClient = mongodb.MongoClient;
	var url = 'mongodb://localhost:27017/myapp';



	var startServer = function() {
		http.createServer(function (req, res) {
			//var queryObject = url.parse(req.url,true).query;
			res.writeHead(200, {
				'Content-Type':  'application/json'
			});
			res.write('hello');
			res.end();
			
		}).listen(SERVER_PORT); 
	}

	return {
		init: function() {
			console.log('mongo test server started on ' + SERVER_PORT);
			startServer();
		}
	}

})();
mongoTestService.init();








