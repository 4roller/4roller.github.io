var cards = (function() {

	var cards;
	var dragSrcEl;
	var CSS_CARDS = '.cards';
	var CSS_DROP_ZONE = '.dropZone';
	var NUMBER_OF_CARDS = 8;

	var initDom = function() {
		cards = document.querySelector(CSS_CARDS);
		dropZone = document.querySelector(CSS_DROP_ZONE);
	};

	var initEvents = function() {
		// file drop events
		dropZone.addEventListener('dragover', function(e) { fileDragOver(e) });
		dropZone.addEventListener('drop', function(e) { fileDrop(e) });
		// card drag and drop events
		cards.addEventListener('dragstart', function(e) { cardDragStart(e); }, false);
		cards.addEventListener('dragenter', function(e) { cardDragEnter(e); }, true);
		cards.addEventListener('dragover', function(e) { cardDragOver(e); }, false);
		cards.addEventListener('dragleave', function(e) { cardDragLeave(e); }, false);
		cards.addEventListener('dragend', function(e) { cardDragEnd(e); }, false);
		cards.addEventListener('drop', function(e) { cardDrop(e); }, false);		

	};

	// file Drag and Drop Methods
	var fileDragOver = function(e) {
		e.preventDefault();
	};
	var fileDrop = function(e) {
		e.preventDefault();
		buildSet(e.dataTransfer.files);
	};

	var getParentCard = function(el) {
		var element = el;
		if(element.tagName != "LI") {
			element = element.parentNode;
		}
		return element;
	}

	// card Drag and Drop Methods
	var cardDragStart = function(e) {
		//console.log('start');
		var el = getParentCard(e.target);
		el.classList.add('drag');
		el.classList.add('selected');
		dragSrcEl = el;
	};
	var cardDragEnter = function(e) {
		e.preventDefault();
    	e.stopPropagation(); 
    	//console.log('enter');
		var el = getParentCard(e.target);
		el.classList.add('drag');
	};
	var cardDragOver = function(e) {
		e.preventDefault();
		e.stopPropagation();
		//console.log('over');
		var el = getParentCard(e.target);
		el.classList.add('over');
	};
	var cardDragLeave = function(e) {
		e.stopPropagation();
        e.preventDefault();
		//console.log('leave');
		var el = getParentCard(e.target);
		el.classList.remove('over');
		el.classList.remove('drag');
	};
	var cardDrop = function(e) {
		e.stopPropagation();
        e.preventDefault();
		// console.log('drop');
		var el = getParentCard(e.target);
		var parent = el.parentNode;
		//console.log(dragSrcEl, el);
		if(dragSrcEl.nextSibling === el) {
			parent.insertBefore(dragSrcEl, el.nextSibling);	
		} else {
			parent.insertBefore(dragSrcEl, el);
		}
		dragSrcEl.classList.add('shrink');
		setTimeout(function() {
			dragSrcEl.classList.add('notify');
		},200)
		setTimeout(function() {
			dragSrcEl.classList.remove('notify');
		},700)
	};
	var cardDragEnd = function(e) {
		e.stopPropagation();
        e.preventDefault();
		[].forEach.call( cards.querySelectorAll('.card'), function(card) {
			card.classList.remove('over', 'drag', 'selected', 'shrink','notify');
		});   
	};

	var createCard = function (i, fileNode) {
		var li = document.createElement('li');
		var h3 = document.createElement('h3');
		li.classList.add('card', 'card' + (i+1));
		li.draggable = true;
		type = fileNode.type.split("/")[0];
		extention = fileNode.type.split("/")[1];
		h3.innerHTML = extention.toUpperCase();
		//h3.innerHTML = "card " + (i+1);
		h3.innerHTML = extention;
		li.appendChild(h3);
		if(type == "image") {
			var img = new Image(190);
			url = window.URL.createObjectURL(fileNode);
			img.src = url;
			li.appendChild(img);
		}
		return li;
	};

	var buildSet = function(arr) {
		var domFrag = document.createDocumentFragment();
		for(var i = 0; i < arr.length; i++) {
		//for(var i = 0; i < NUMBER_OF_CARDS; i++) {
			domFrag.appendChild( createCard(i, arr[i]) );
			//domFrag.appendChild(createCard(i, null))
		}
		cards.querySelector('ul').appendChild(domFrag);
	};


	return {
		init: function() {
			initDom();
			//buildSet();
			initEvents();
			
		}

	}

})();

