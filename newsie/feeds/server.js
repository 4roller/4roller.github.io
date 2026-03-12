var newsieFeedService = (function () {

	// Requrires
	var fs = require('fs');
	var http = require('http');
	var url = require('url');
	var request = require('request');
	var xml2js = require('xml2js').parseString;
	var Promise = require('promise');

	var MAX_PULL = 15;
	var SERVER_PORT = 3333;



	// Maos for Source and Topic end points
	var sources = {
		'nyt': {
			'feed': 'https://rss.nytimes.com/services/xml/rss/nyt/$topic.xml',
			'topics': {
				'World': 'world',
				'Business': 'business',
				'Arts': 'arts',
				'Technology': 'technology',
				'Science': 'science',
				'Style': 'style',
				'Travel': 'travel',
				'Opinion': 'opinion',
				'Lens': 'opinion',
				'Health': 'health',
				'Most Shared': 'MostShared',
				'Automobiles': 'Automobiles',
			}
		},
		'bbc': {
			'feed': 'http://feeds.bbci.co.uk/news/$topic/rss.xml',
			'topics': {
				'Top Stories': '',
				'World': 'world',
				'US and Canada': 'world/us_and_canada',
				'Business': 'business',
				'Politics': 'politics',
				'Health': 'health',
				'Education': 'education',
				'Science': 'science_and_environment',
				'Technology': 'technology',
				'Entertainment': 'entertainment_and_arts'
			}
		},
		'npr': {
			'feed': 'http://www.npr.org/rss/rss.php?id=$topic',
			'topics': {
				'Top Stories': '1001',
				'World': '1004',
				'US': '1003',
				'Business': '1006',
				'People': '1023',
				'Health and Science': '1007',
				'Technology': '1019',
				'Food': '1053'
			}
		},
		'lat': {
			'feed': 'http://www.latimes.com/$topic/rss2.0.xml',
			'topics': {
				'World': 'world',
				'Business': 'business',
				'Nation': 'nation',
				"Real Estate": 'business/realestate',
				"Science": 'science',
				"Technology": 'business/technology',
				'Entertainment': 'entertainment',
				'Transportation': 'local/transportation',
				'Lifestyle': 'style',
				'Travel': 'travel',
				'Sports': 'sports',
				'Opinion': 'opinion',
				'Health': 'health',
				'Local': 'local',
				"Food": 'food',
				'Health': 'health',
				'Westside': 'local/westside'
			}
		},
	}


	var mapNYT = function (obj) {
		var getMedia = function () {
			var media = null;
			if (typeof obj['media:content'] == "object") {
				media = {
					'thumbnail': obj['media:content'][0]['$']['url'],
				}
			}
			return media;
		}
		return {
			'title': obj['title'],
			'date': obj['pubDate'],
			'description': obj['description'][0],
			'media': getMedia(),
			'link': obj['link'],
			'subsection': obj['subsection']
		}
	}
	var mapLAT = function (obj) {
		var getMedia = function () {
			var media = null;
			if (obj['media:content']) {
				media = {
					'thumbnail': obj['media:content'][0]['$']['url'],
				}
			}
			return media;
		}
		return {
			'title': obj['title'],
			'date': obj['pubDate'],
			'description': obj['description'],
			'media': getMedia(),
			'link': obj['link']
		}
	}
	var mapBBC = function (obj) {
		var getMedia = function () {
			var media = null;
			if (obj['media:thumbnail']) {
				media = {
					'thumbnail': obj['media:thumbnail'][0]['$']['url']
				}
			}
			return media;
		}
		return {
			'title': obj['title'],
			'date': obj['pubDate'],
			'description': obj['description'],
			'media': getMedia(),
			'link': obj['link']
		}
	}
	var mapNPR = function (obj) {
		return {
			'title': obj['title'],
			'date': obj['pubDate'],
			'description': obj['description'],
			//'media': obj['media:thumbnail'][0]['$']['url'],
			'link': obj['link']
		}
	}



	var normalizeArticles = function (rawObj, source) {
		var promise = new Promise(function (resolve, reject) {
			var handlerObj = {}
			var articles = [];
			switch (source) {
				case 'nyt':
					handlerObj = {
						'results': rawObj['rss']['channel'][0]['item'],
						'mapFn': mapNYT
					}
					break;
				case 'lat':
					handlerObj = {
						'results': rawObj['rss']['channel'][0]['item'],
						'mapFn': mapLAT
					}
					break;
				case 'bbc':
					handlerObj = {
						'results': rawObj['rss']['channel'][0]['item'],
						'mapFn': mapBBC
					}
					break;
				case 'npr':
					handlerObj = {
						'results': rawObj['rss']['channel'][0]['item'],
						'mapFn': mapNPR
					}
					break;
			}
			for (var i = 0,
				length = (handlerObj['results'].length < MAX_PULL) ? handlerObj['results'].length : MAX_PULL;
				i < length;
				i++) {
				articles.push(handlerObj.mapFn(handlerObj.results[i]))
			}
			var obj = {
				'result': articles
			}
			// console.log(obj);
			resolve(obj);
		});
		return promise;
	}

	var fetchStream = function (url, source, res) {
		var options = {
			"url": url,
			"headers": {
				'User-Agent': 'node server'
			}
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var cType = response['caseless']['dict']['content-type'];
				// Source returned JSON
				if (cType.indexOf('json') > -1) {
					var jsonObj = body;
					normalizeArticles(body, source).then(function (result) {
						res.writeHead(200, {
							'Content-Type': 'application/json'
						});
						res.end(JSON.stringify(result));
					});
				}
				// Source returned XML
				else if (cType.indexOf('xml') > -1) {
					xml2js(body, function (err, jsonObj) {
						normalizeArticles(jsonObj, source).then(function (result) {
							res.writeHead(200, {
								'Content-Type': 'application/json'
							});
							res.end(JSON.stringify(result));
						});
					});
				}
			}
		});
	}


	var startServer = function () {
		http.createServer(function (req, res) {
			res.setHeader('Access-Control-Allow-Origin', null); // Or a specific origin like 'http://localhost:5500'

			var queryObject = url.parse(req.url, true).query;

			// Handle Source and Topic Fetch because there are query params
			if (queryObject.source && queryObject.topic) {
				// Create a url
				var someURL = sources[queryObject.source].feed.replace('$topic', sources[queryObject.source].topics[queryObject.topic]);


				console.log(someURL)
				fetchStream(someURL, queryObject.source, res);



			} else { // Send the Sources as a JSON object

				res.writeHead(200, {
					'Content-Type': 'application/json'
				});
				res.write(JSON.stringify(sources));
				res.end();
			}
		}).listen(SERVER_PORT);
	}

	return {
		init: function () {
			console.log('newsie feed server started on ' + SERVER_PORT);
			startServer();
		}
	}

})();
newsieFeedService.init();








