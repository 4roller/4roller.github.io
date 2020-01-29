var hlss = (function(){
	var textArea;
	var btnSlideShow, btnNext, btnPrev;
	var slideShow, slideLayer1, slideLayer2;

	var urlArr = [];
	var indexCurr = 0;
	var forwardDirection = true; // TRUE forwards, FALSE backwards

	var initDom = function() {
		textArea = document.querySelector('#textArea');
		btnSlideShow = document.querySelector('#btnSlideShow');
		btnPrev = document.querySelector('#btnPrev');
		btnNext = document.querySelector('#btnNext');

		slideShow = document.querySelector('#slideShow');
		slideLayerPrev = document.querySelector('#slideLayerPrev');
		slideLayerCurr = document.querySelector('#slideLayerCurr');
		slideLayerNext = document.querySelector('#slideLayerNext');
	}

	var initEvents = function() {
		btnSlideShow.addEventListener('click', startShow);
		btnNext.addEventListener('click', nextHandler);
		btnPrev.addEventListener('click', prevHandler);
		window.addEventListener('keyup', handleKeys);
	}

	var handleKeys = function(e) {
		//console.log(e.keyCode);
		switch(e.keyCode) {
			case 39:
				nextHandler();
				break;
			case 37:
				prevHandler();
				break;
			case 32:
				loop();
				break;
			default: 
				break;
		}
	}

	var loop = function() {
		console.log('loop init');
		setInterval(function() {
			console.log('...');
			btnNext.click();
		},5000);
	}

	var startShow = function() {
		urlArr = parseAndInsert(textArea.value);
		if(urlArr.length > 0) {
			initSlideShow(indexCurr);					
		}
	}

	var nextHandler = function() {
		indexCurr = indexCurr + 1;
		if(indexCurr > urlArr.length - 1) {
			indexCurr = 0;
		}
		forwardDirection = true;
		changeIndex(indexCurr);
	}

	var prevHandler = function() {
		indexCurr = indexCurr - 1;
		if(indexCurr < 0) {
			indexCurr = urlArr.length - 1;
		}
		forwardDirection = false;
		changeIndex(indexCurr);
	}

	var initSlideShow = function(idx) {
		clearSlides();
		var idxPrev = urlArr.length -1;
		var idxCurr = idx;
		var idxNext = idx + 1;
		var imgPrev = document.createElement('img');
		var imgCurr = document.createElement('img');
		var imgNext = document.createElement('img');

		imgPrev.src = urlArr[idxPrev];
		imgCurr.src = urlArr[idxCurr];
		imgNext.src = urlArr[idxNext];

		slideLayerPrev.appendChild(imgPrev);
		slideLayerCurr.appendChild(imgCurr);
		slideLayerNext.appendChild(imgNext);
	}

	var changeIndex = function(idx) {
		var newPrevEl, newCurrEl, newNextEl;
		var idxPrev = idx -1;
		var idxNext = idx + 1;
		if(idx == 0) { idxPrev = urlArr.length - 1 ; }
		if(idx == urlArr.length -1 ) { idxNext = 0; }

		var imgPrev = slideLayerPrev.querySelector('img');
		var imgCurr = slideLayerCurr.querySelector('img');
		var imgNext = slideLayerNext.querySelector('img');

		if(forwardDirection) {
			slideLayerPrev.classList.add('nodisplay');
			//slideLayerNext.classList.remove('faded');
			slideLayerCurr.classList.add('fadeout');

			setTimeout(function() {
				clearSlides();
				slideLayerPrev.appendChild(imgCurr);
				slideLayerCurr.appendChild(imgNext);
				slideLayerNext.appendChild(createImageElFromIndex(idxNext));
				slideLayerCurr.classList.remove('fadeout');
				slideLayerPrev.classList.remove('nodisplay');
			}, 300)

		} else {
			slideLayerNext.classList.add('nodisplay');
			//slideLayerPrev.classList.remove('faded');
			slideLayerCurr.classList.add('fadeout');
			setTimeout(function() {
				clearSlides();
				slideLayerPrev.appendChild(createImageElFromIndex(idxPrev));
				slideLayerCurr.appendChild(imgPrev);
				slideLayerNext.appendChild(imgCurr);
				slideLayerCurr.classList.remove('fadeout');
				slideLayerNext.classList.remove('nodisplay');
			}, 300);
		}

	}

	var clearSlides = function() {
		slideLayerPrev.innerHTML = "";;
		slideLayerCurr.innerHTML = "";
		slideLayerNext.innerHTML = "";
	}

	var createImageElFromIndex = function(idx) {
		var img = document.createElement('img');
		img.src = urlArr[idx];
		return img;
	}

	var parseAndInsert = function(dirtyText) {		
		return dirtyText.trim().split("\n");
	}

	return {
		init: function() {
			initDom();
			initEvents();
		}
	}

})();

hlss.init();
