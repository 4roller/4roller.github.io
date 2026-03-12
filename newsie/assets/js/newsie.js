/* 
Newsie App - Jason Leung - 2015.01
Node in the backend with RSS feeds from news providers 
Pure Javascript Front End
*/


var newsie = (function() {

	// CSS 
	var CSS_NAV = "#nav";
	var CSS_NEWS_LIST = "#newsList";
	var CSS_TEMPLATE_CLONE = "#templateClone";	
	var CSS_BTN_SOURCES = ".btnSources";
	var CSS_CURRENTLY_READING = "#currentlyReading";
	var CSS_CURRENTLY_READING_TOPIC = ".currentlyReadingTopic";

	// DOM elements
	var nav, newsList, templateClone, btnSources, currentlyReading;

	var curTimestamp = Math.round((new Date()).getTime()) ; 
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

	var initDOM = function() {
		nav = document.querySelector(CSS_NAV);
		newsList = document.querySelector(CSS_NEWS_LIST);
		templateClone = document.querySelector(CSS_TEMPLATE_CLONE);
		btnSources = document.querySelector(CSS_BTN_SOURCES);
		currentlyReading = document.querySelector(CSS_CURRENTLY_READING);
		currentlyReadingTopic = document.querySelector(CSS_CURRENTLY_READING_TOPIC);
	}

	var attachListeners = function() {
		btnSources.addEventListener('click', function(e) {
			nav.classList.toggle('show');
		});
		window.addEventListener('touchstart', touchStartHandler);
		window.addEventListener('touchmove', touchMoveHandler);
		window.addEventListener('touchend', touchEndHandler);
		window.addEventListener('keyup', handleKeyUp);
	}

	var handleKeyUp = function(e) {
		//console.log(e.keyCode);
		switch(e.keyCode) {
			case 39:
				swipeRight();
				break;
			case 37:
				swipeLeft();
				break;
		}
	}

	var resetTouches = function() {
		tStart = {};
		tMove = {};
	}

	var touchStartHandler = function(e) {
		tStart = {
			'x': e.touches[0].pageX,
			'y': e.touches[0].pageY
		};
	}
	var touchMoveHandler = function(e) {
		tMove = {
			'x': e.touches[0].pageX,
			'y': e.touches[0].pageY
		};
	}

	var touchEndHandler = function(e) {
		var deltaX = parseInt(tMove.x - tStart.x, 10);
		var deltaY = parseInt(tMove.y - tStart.y, 10);
		console.log(deltaX);
		if(Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MIN_SWIPE && !isNaN(deltaX)) {
			tStart = {};
			tMove = {};
			if(deltaX > 0) {
				swipeLeft();
			} else if (deltaX < 0) {
				swipeRight();
			}
		}
		resetTouches();
	}

	var swipeRight = function() {
		var parent = nav.querySelector('ul.' + current.src);
		var child = parent.querySelector('li[data-topic="' + current.topic + '"]');
		if(child.nextSibling) {
			child.nextSibling.click();	
		} else { 
			getNextSource(parent);
		}
		
	}
	var swipeLeft = function() {
		var parent = nav.querySelector('ul.' + current.src);
		var child = parent.querySelector('li[data-topic="' + current.topic + '"]');
		if(child.previousSibling) {
			child.previousSibling.click();	
		} else {
			getPreviousSource(parent);
		}
	}

	var getNextSource = function(curSrc) {
		var curEl = curSrc;
		curEl = curEl.nextSibling;
		//last Element
		if(curEl == null) {
			nav.querySelector('.lat li:nth-child(1)').click();
			return;
		}
		while(curEl.tagName != "UL") {
			if(curEl.parentNode.lastChild == curEl) {
				curEl = curEl.parentNode.firstChild;
				break;
			}
			curEl = curEl.nextSibling;
		}
		curEl.firstChild.click();
	}


	var getPreviousSource = function(curSrc) {
		var curEl = curSrc;
		curEl = curEl.previousSibling;
		while(curEl.tagName != "UL") {
			if(curEl.parentNode.firstChild == curEl) {
				curEl = curEl.parentNode.lastChild;
				break;
			}
			curEl = curEl.previousSibling;
		}
		curEl.lastChild.click();
	}
	
	var createNavigation = function(obj) {
		for(var key in obj) {
			var label = document.createElement('label');
			label.classList.add(key);
			label.classList.add('logo');
			var ul = document.createElement('ul');
			ul.classList.add(key);
			ul.setAttribute('data-src', key);
			var topics = obj[key]['topics'];
			for(var topic in topics) {
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

	var attachedNavigationHandlers = function() {
		if(nav.hasChildNodes()) {
			nav.addEventListener('click', function(e) {
				if(e.target.tagName == "LI" && e.target.hasAttribute('data-topic')) {
					var obj = {
						'src': e.target.parentNode.getAttribute('data-src'),
						'topic': e.target.getAttribute('data-topic')
					}
					newsList.classList.add('fadeOut');
					setTimeout(function() { // Handle Fadeout
						fetchArticles(obj);
					}, 300);
					updateCurrentylyReading(obj);
					nav.classList.remove('show');
					scrollTo(0,0);
					//var url = "/newsie/" + obj.src + "/" + obj.topic
					//window.history.pushState(null,null, url);
					current = obj;
				}
			});			
		}
		// Get the first default batch of articles
		if(!isInit) {
			getFirstBatch();
			isInit = true;	
		}
	}

	var updateCurrentylyReading = function(obj) {
		currentlyReadingTopic.setAttribute('data-content', obj.topic);
		currentlyReading.className = "";
		currentlyReading.classList.add(obj.src);
	}

	var fetchArticles = function(obj) {
		var url = 'http://localhost:3333/?source=' + obj.src + '&topic=' + obj.topic;
		fetch(url).then(function(result) {
			populateNewsList(JSON.parse(result));
		});
	}

	var fetchSourcesAndTopics = function() {
		fetch('http://localhost:3333/').then(function(result) {			
			createNavigation(JSON.parse(result));
		});
	}

	var populateNewsList = function(obj) {
		newsList.innerHTML = "";
		newsList.classList.remove('fadeOut');
		var result = obj.result;
		var ul = document.createDocumentFragment();
		for(var i=0, length = result.length; i<length; i++) {
			var li = document.createElement('li');
			var article = templateClone.cloneNode(true); 
			article.removeAttribute('id');
			var a = article.querySelector('h3 a')
			a.innerHTML = result[i].title;
			a.href = result[i].link;
			article.querySelector('date').innerHTML = niceDate(result[i].date);
			if(result[i].subsection) {
				var subSection = article.querySelector('subsection');
				subSection.classList.add('show');
				subSection.innerHTML = "#" + result[i].subsection;				
			}
			article.querySelector('description').innerHTML = result[i].description;
			if(result[i].media) {
				var img = article.querySelector('img');
				img.parentNode.classList.add('show');
				img.classList.add('show');
				img.setAttribute('data-src-thumbnail', result[i].media.thumbnail);
				if(result[i].media.medium) {
					img.setAttribute('data-src-medium', result[i].media.medium);	
				}
				if (result[i].media.full ) {
					img.setAttribute('data-src-full', result[i].media.full);
				}
			} 
			ul.appendChild(article);

		}
		newsList.appendChild(ul);
		setImages();
		attachMoreLessHandlers();
	}

	var attachMoreLessHandlers = function() {
		if(!moreLessInit) {
			moreLessInit = true;
			if(newsList.hasChildNodes()) {
				newsList.addEventListener('click', function(e) {
					if(e.target.classList.contains('moreless')) {
						e.target.classList.toggle('minus');
						e.target.parentNode.querySelector('description').classList.toggle('show');
					}
				});
			}

		}
	}

	var renderImagesInViewport = function() {
		var range = {
			top: window.scrollY,
			bottom: window.scrollY + window.innerHeight
		}
		clearTimeout(scrollTimeout);
		setTimeout(function() {
			for(var i = 0, length = allImages.length; i < length; i++) {
				if(isWithinBounds(allImages[i], range)) {
					allImages[i].src = allImages[i].getAttribute('data-src-thumbnail');	
				}
			}
		},50);
	}

	var isWithinBounds = function(el,range) {
		var elRange = el.getBoundingClientRect();
		if(range.top < elRange.top &&
			range.bottom > elRange.top) {
			return true;
		}
	}

	var setImages = function() {
		allImages = document.querySelectorAll('img');
		renderImagesInViewport();
		window.addEventListener('scroll', function(e) {
			renderImagesInViewport();	
		});
	}

	var fetch = function(url) {
	    return new Promise(function(resolve, reject) {
	      var request = new XMLHttpRequest();
	      request.open('GET', url, true);
	      request.onload = function() {
	        if (request.status === 200) {
	          resolve(request.response);
	        } else {
	          reject(console.log('error code:' + request.statusText));
	        }
	      };
	      request.onerror = function() {
	          reject(console.log('There was a network error.'));
	      };
	      request.send();
	    });
	}

	var niceDate = function(dateString) {
		var output;
		var unixtime = Date.parse( dateString );
		var timeDiff = Math.round( (curTimestamp - unixtime)  );
		if(timeDiff < 0) {
			output = "Just Now";
		}
		else if(timeDiff < 3.6e+6) {
			output = Math.round(Math.abs(timeDiff/60000)) + " minutes ago";
		} else if ( timeDiff < 8.28e+7 && timeDiff > 3.6e+6) {
			hour = Math.round(Math.abs(timeDiff/3.6e+6));
			if (hour == 1) {
				output = "1 hour ago";
			} else {
				output = hour + " hours ago";
			}
		} else {
            var d = new Date(unixtime);
			output = d.toString('dddd, MMMM, yyyy').substr(0,16);
			// For browsers that don't have ISO-8601 Date implementation
			if (output === 'Invalid Date') {
				output = dateString;
			}
		} 
		return output;
	}

	var getFirstBatch = function() {
		nav.querySelector('.nyt li:nth-child(1)').click();
	}

	var isMobileDevice = function() {
		if( navigator.userAgent.match(/Android/i)
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
		init: function() {
			initDOM();
			isMobile = isMobileDevice();
			attachListeners();
			fetchSourcesAndTopics();
		}
	}
})();

newsie.init();