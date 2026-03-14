/* 
Newsie App - Jason Leung - 2015.01
Node in the backend with RSS feeds from news providers 
Pure Javascript Front End
*/


var newsie = (function () {

	// CSS 
	var CSS_NAV = "#nav";
	var CSS_NEWS_LIST = "#newsList";
	var CSS_TEMPLATE_CLONE = "#templateClone";
	var CSS_BTN_SOURCES = ".btnSources";
	var CSS_CURRENTLY_READING = "#currentlyReading";
	var CSS_CURRENTLY_READING_TOPIC = ".currentlyReadingTopic";

	// DOM elements
	var nav, newsList, templateClone, btnSources, currentlyReading;

	var curTimestamp = Math.round((new Date()).getTime());
	var allImages;
	var scrollTimeout;
	var isInit = false;
	var moreLessInit = false;

	// Touch Event Vars
	var current = {};
	var tStart = {};
	var tMove = {};
	var MIN_SWIPE = 150;
	var isMobile;

	const MAX_PULL = 15;


	var initDOM = function () {
		nav = document.querySelector(CSS_NAV);
		newsList = document.querySelector(CSS_NEWS_LIST);
		templateClone = document.querySelector(CSS_TEMPLATE_CLONE);
		btnSources = document.querySelector(CSS_BTN_SOURCES);
		currentlyReading = document.querySelector(CSS_CURRENTLY_READING);
		currentlyReadingTopic = document.querySelector(CSS_CURRENTLY_READING_TOPIC);
	}

	var attachListeners = function () {
		btnSources.addEventListener('click', function (e) {
			nav.classList.toggle('show');
		});
		window.addEventListener('touchstart', touchStartHandler);
		window.addEventListener('touchmove', touchMoveHandler);
		window.addEventListener('touchend', touchEndHandler);
		window.addEventListener('keyup', handleKeyUp);
	}

	var handleKeyUp = function (e) {
		//console.log(e.keyCode);
		switch (e.keyCode) {
			case 39:
				swipeRight();
				break;
			case 37:
				swipeLeft();
				break;
		}
	}
	var resetTouches = function () {
		tStart = {};
		tMove = {};
	}
	var touchStartHandler = function (e) {
		tStart = {
			'x': e.touches[0].pageX,
			'y': e.touches[0].pageY
		};
	}
	var touchMoveHandler = function (e) {
		tMove = {
			'x': e.touches[0].pageX,
			'y': e.touches[0].pageY
		};
	}
	var touchEndHandler = function (e) {
		var deltaX = parseInt(tMove.x - tStart.x, 10);
		var deltaY = parseInt(tMove.y - tStart.y, 10);
		console.log(deltaX);
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MIN_SWIPE && !isNaN(deltaX)) {
			tStart = {};
			tMove = {};
			if (deltaX > 0) {
				swipeLeft();
			} else if (deltaX < 0) {
				swipeRight();
			}
		}
		resetTouches();
	}
	var swipeRight = function () {
		var parent = nav.querySelector('ul.' + current.src);
		var child = parent.querySelector('li[data-topic="' + current.topic + '"]');
		if (child.nextSibling) {
			child.nextSibling.click();
		} else {
			getNextSource(parent);
		}

	}
	var swipeLeft = function () {
		var parent = nav.querySelector('ul.' + current.src);
		var child = parent.querySelector('li[data-topic="' + current.topic + '"]');
		if (child.previousSibling) {
			child.previousSibling.click();
		} else {
			getPreviousSource(parent);
		}
	}
	var getNextSource = function (curSrc) {
		var curEl = curSrc;
		curEl = curEl.nextSibling;
		//last Element
		if (curEl == null) {
			nav.querySelector('.lat li:nth-child(1)').click();
			return;
		}
		while (curEl.tagName != "UL") {
			if (curEl.parentNode.lastChild == curEl) {
				curEl = curEl.parentNode.firstChild;
				break;
			}
			curEl = curEl.nextSibling;
		}
		curEl.firstChild.click();
	}
	var getPreviousSource = function (curSrc) {
		var curEl = curSrc;
		curEl = curEl.previousSibling;
		while (curEl.tagName != "UL") {
			if (curEl.parentNode.firstChild == curEl) {
				curEl = curEl.parentNode.lastChild;
				break;
			}
			curEl = curEl.previousSibling;
		}
		curEl.lastChild.click();
	}

	var createNavigation = function (obj) {
		for (var key in obj) {
			var label = document.createElement('label');
			label.classList.add(key);
			label.classList.add('logo');
			var ul = document.createElement('ul');
			ul.classList.add(key);
			ul.setAttribute('data-src', key);
			var topics = obj[key]['topics'];
			for (var topic in topics) {
				var li = document.createElement('li');
				li.setAttribute('data-topic', topic);
				li.innerHTML = topic;
				ul.appendChild(li);
			}
			nav.appendChild(label);
			nav.appendChild(ul);
		}
		attachedNavigationHandlers();
	}

	var attachedNavigationHandlers = function () {
		if (nav.hasChildNodes()) {
			nav.addEventListener('click', function (e) {
				if (e.target.tagName == "LI" && e.target.hasAttribute('data-topic')) {
					var obj = {
						'src': e.target.parentNode.getAttribute('data-src'),
						'topic': e.target.getAttribute('data-topic')
					}
					newsList.classList.add('fadeOut');
					setTimeout(function () { // Handle Fadeout
						fetchArticles(obj);
					}, 300);
					updateCurrentylyReading(obj);
					nav.classList.remove('show');
					scrollTo(0, 0);
					//var url = "/newsie/" + obj.src + "/" + obj.topic
					//window.history.pushState(null,null, url);
					current = obj;
				}
			});
		}
		// Get the first default batch of articles
		if (!isInit) {
			getFirstBatch();
			isInit = true;
		}
	}

	var updateCurrentylyReading = function (obj) {
		currentlyReadingTopic.setAttribute('data-content', obj.topic);
		currentlyReading.className = "";
		currentlyReading.classList.add(obj.src);
	}


// Function to convert XML DOM to JS Object recursively
function xmlToJson(xml) {
    let obj = {};
    if (xml.nodeType === 1) { // element node
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                const attr = xml.attributes.item(j);
                obj["@attributes"][attr.nodeName] = attr.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) { // text node
        obj = xml.nodeValue;
    }

    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;
            if (typeof (obj[nodeName]) === "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (!Array.isArray(obj[nodeName])) obj[nodeName] = [obj[nodeName]];
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}


var normalizeArticles = function (rawObj, source) {

		var promise = new Promise(function (resolve, reject) {
			var handlerObj = {}
			var articles = [];
			switch (source) {
				case 'nyt':
					handlerObj = {
						'results': rawObj['channel']['item'],
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
		
			resolve(obj);
		});
		return promise;
	}



	var fetchArticles = function (obj) {
		var url = 'http://localhost:3333/?source=' + obj.src + '&topic=' + obj.topic;

		console.log(obj);

		
		var someURL = sources[obj.src].feed.replace('$topic', sources[obj.src].topics[obj.topic]);
		console.log(someURL);


		

		fetch(someURL).then(function (result) {
			
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(result, "text/xml");
			
			const jsObject = xmlToJson(xmlDoc.documentElement);



			normalizeArticles(jsObject, obj.src).then(function (result2) {
				//  console.log(result2)
				 populateNewsList(result2);
			});
			
		});
	}


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
		// console.log(obj);
			if (typeof obj['media:content'] == "object") {
				media = {
					'thumbnail': obj['media:content']['@attributes']['url'],
				}
			}
			return media;
		}
		return {
			'title': obj['title']['#text'],
			'date': obj['pubDate']['#text'],
			'description': obj['description']['#text'],
			'media': getMedia(),
			'link': obj['link']['#text'],
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



	











	var fetchSourcesAndTopics = function () {
		// fetch('http://localhost:3333/').then(function (result) {
		// 	createNavigation(JSON.parse(result));
		// });
		createNavigation(sources);
	}

	var populateNewsList = function (obj) {
		newsList.innerHTML = "";
		newsList.classList.remove('fadeOut');
		var result = obj.result;
		var ul = document.createDocumentFragment();
		for (var i = 0, length = result.length; i < length; i++) {
			var li = document.createElement('li');
			var article = templateClone.cloneNode(true);
			article.removeAttribute('id');
			var a = article.querySelector('h3 a')
			a.innerHTML = result[i].title;
			a.href = result[i].link;
			article.querySelector('date').innerHTML = niceDate(result[i].date);
			if (result[i].subsection) {
				var subSection = article.querySelector('subsection');
				subSection.classList.add('show');
				subSection.innerHTML = "#" + result[i].subsection;
			}
			article.querySelector('description').innerHTML = result[i].description;
			if (result[i].media) {
				var img = article.querySelector('img');
				img.parentNode.classList.add('show');
				img.classList.add('show');
				img.setAttribute('data-src-thumbnail', result[i].media.thumbnail);
				if (result[i].media.medium) {
					img.setAttribute('data-src-medium', result[i].media.medium);
				}
				if (result[i].media.full) {
					img.setAttribute('data-src-full', result[i].media.full);
				}
			}
			ul.appendChild(article);

		}
		newsList.appendChild(ul);
		setImages();
		attachMoreLessHandlers();
	}

	var attachMoreLessHandlers = function () {
		if (!moreLessInit) {
			moreLessInit = true;
			if (newsList.hasChildNodes()) {
				newsList.addEventListener('click', function (e) {
					if (e.target.classList.contains('moreless')) {
						e.target.classList.toggle('minus');
						e.target.parentNode.querySelector('description').classList.toggle('show');
					}
				});
			}

		}
	}

	var renderImagesInViewport = function () {
		var range = {
			top: window.scrollY,
			bottom: window.scrollY + window.innerHeight
		}
		clearTimeout(scrollTimeout);
		setTimeout(function () {
			for (var i = 0, length = allImages.length; i < length; i++) {
				if (isWithinBounds(allImages[i], range)) {
					allImages[i].src = allImages[i].getAttribute('data-src-thumbnail');
				}
			}
		}, 50);
	}

	var isWithinBounds = function (el, range) {
		var elRange = el.getBoundingClientRect();
		if (range.top < elRange.top &&
			range.bottom > elRange.top) {
			return true;
		}
	}

	var setImages = function () {
		allImages = document.querySelectorAll('img');
		renderImagesInViewport();
		window.addEventListener('scroll', function (e) {
			renderImagesInViewport();
		});
	}

	var fetch = function (url) {
		return new Promise(function (resolve, reject) {
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.onload = function () {
				if (request.status === 200) {
					resolve(request.response);
				} else {
					reject(console.log('error code:' + request.statusText));
				}
			};
			request.onerror = function () {
				reject(console.log('There was a network error.'));
			};
			request.send();
		});
	}

	var niceDate = function (dateString) {
		var output;
		var unixtime = Date.parse(dateString);
		var timeDiff = Math.round((curTimestamp - unixtime));
		if (timeDiff < 0) {
			output = "Just Now";
		}
		else if (timeDiff < 3.6e+6) {
			output = Math.round(Math.abs(timeDiff / 60000)) + " minutes ago";
		} else if (timeDiff < 8.28e+7 && timeDiff > 3.6e+6) {
			hour = Math.round(Math.abs(timeDiff / 3.6e+6));
			if (hour == 1) {
				output = "1 hour ago";
			} else {
				output = hour + " hours ago";
			}
		} else {
			var d = new Date(unixtime);
			output = d.toString('dddd, MMMM, yyyy').substr(0, 16);
			// For browsers that don't have ISO-8601 Date implementation
			if (output === 'Invalid Date') {
				output = dateString;
			}
		}
		return output;
	}

	var getFirstBatch = function () {
		nav.querySelector('.nyt li:nth-child(1)').click();
	}

	var isMobileDevice = function () {
		if (navigator.userAgent.match(/Android/i)
			|| navigator.userAgent.match(/webOS/i)
			|| navigator.userAgent.match(/iPhone/i)
			|| navigator.userAgent.match(/iPad/i)
			|| navigator.userAgent.match(/iPod/i)
			|| navigator.userAgent.match(/BlackBerry/i)
			|| navigator.userAgent.match(/Windows Phone/i)) {
			return true;
		} else {
			return false;
		}
	}

	return {
		init: function () {
			initDOM();
			isMobile = isMobileDevice();
			attachListeners();
			fetchSourcesAndTopics();
		}
	}
})();

newsie.init();