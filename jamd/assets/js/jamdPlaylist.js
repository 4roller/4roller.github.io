
var jamdPL = (function(){ 
	var d = document;
	var currentTrackIndex,pushTimeout, currentFiles;
	return {
		playlist: [],
		init: function() {
			jamdPL.attatchListeners();
		},
		attatchListeners: function() {
			d.querySelector('.dropInstructions').addEventListener('dragstart', function(e) { jamdPL.dragStart(e); });
			d.querySelector('.dropInstructions').addEventListener('dragenter', function(e) { jamdPL.dragEnter(e); });
			d.querySelector('.dropInstructions').addEventListener('dragover', function(e) { jamdPL.dragOver(e); });
			d.querySelector('.dropInstructions').addEventListener('dragleave', function(e) { jamdPL.dragLeave(e); });
			d.querySelector('.dropInstructions').addEventListener('drop', function(e) { jamdPL.dropFile(e); });
			d.querySelector('#playlist').addEventListener('dragstart', function(e) { jamdPL.dragItemStart(e); });
			d.querySelector('#playlist').addEventListener('dragenter', function(e) { jamdPL.dragEnter(e); });
			d.querySelector('#playlist').addEventListener('dragover',  function(e) { jamdPL.dragOver(e); });
			d.querySelector('#playlist').addEventListener('dragleave', function(e) { jamdPL.dragLeave(e); });
			d.querySelector('#playlist').addEventListener('drop', function(e) { jamdPL.dropItem(e); });
			d.querySelector('#playlist').addEventListener('click', function(e){ jamdPL.selectThis(e); });
			// Listen for playlist Pushed event and select the first item in playlist.
			d.addEventListener('plPushed', function(e){ 
				jamdPL.sortPL();
				//var firstPlaylistItem = document.querySelector('.c2p');
				//d.querySelector(firstPlaylistItem).click();
			});
		},
		dragItemStart: function(e) {
			var siblings = e.target.parentNode.childNodes;
			var el = e.target;
			//Strange way to find index of the item in a list without converting domElements to array
			var indexOfItem =  Array.prototype.indexOf.call(siblings, el); 
			el.style.opacity = '0.4';
			e.dataTransfer.setData('indexOfItem', indexOfItem);
			e.dataTransfer.dropEffect = 'move';
		},
		// Reording Playlist items
		dropItem: function(e) {
			e.preventDefault();
			var parent = e.target.parentNode;
			var siblings = parent.childNodes;
			var el = e.target;
			var indexOfItem =  parseInt(e.dataTransfer.getData('indexOfItem'));
			var currentIndex = parseInt(Array.prototype.indexOf.call(siblings, el));
			parent.insertBefore(siblings[indexOfItem], siblings[currentIndex]);
			var item = jamdPL.playlist[indexOfItem];
			jamdPL.playlist.splice(currentIndex, 0, item);
			if(currentIndex > indexOfItem) {
				jamdPL.playlist.splice(indexOfItem, 1);
			} else {
				jamdPL.playlist.splice(indexOfItem+1, 1);
			}
			if(currentTrackIndex == indexOfItem) {
				currentTrackIndex = currentIndex-1;
			}
			var forEach = Array.prototype.forEach;
			forEach.call(siblings, function(item){
				item.style.opacity = '1';
			});
			e.target.classList.remove('over');
			return false;
		},
		// Drag and Drop event handlers 
		dragStart: function(e) {
			var el = e.target;
			el.style.opacity = '0.4';
			e.dataTransfer.dropEffect = 'move';
		},
		dragEnter: function(e) {
			e.target.classList.add('over');
		},
		dragOver: function(e) {
			e.preventDefault();
			return false;
		},
		dragLeave: function(e) {
			e.target.classList.remove('over');			
		},
		dropFile:function(e) {
			e.preventDefault();
			var dt = e.dataTransfer;  
			var possibleURL = dt.getData(dt.types[0]);

			if(possibleURL.length > 0) {
				var tempArr = [];
				var urlArr = possibleURL.split(/\n/);
				urlArr.forEach(function(obj) {
					var newObj = {
						"name" : obj,
						"type" : "audio/stream"
					};
					tempArr.push(newObj);	
				});
				currentFiles = tempArr;
				jamdPL.populatePlayListByURLs(currentFiles);
			} else {
				currentFiles = dt.files;	
				jamdPL.populatePlaylistByFiles(currentFiles);
			}
			
			d.querySelector('.dropInstructions').classList.remove('over');			
			return false;

			// Interesting way to do a forEach using (call);
			// [].forEach.call(dt.types, function (type) {});
		},
		getId3: function(f, callbackFn) {
			var r = new FileReader();
			r.onload = function(e) { 
				result = e.target.result
				var dv = new jDataView(result);
				if( dv.getString(3, dv.byteLength - 128) == "TAG") {
					returnObj = {
						"title": dv.getString(30, dv.tell()), 
						"artist": dv.getString(30, dv.tell()),
						'fileObject': f
					};
					callbackFn(returnObj);
				} else { // No ID3 Tag
					returnObj = {
						"title": null, 
						"artist": null,
						'fileObject': f
					}
					callbackFn(returnObj);
				}
			}
			r.readAsArrayBuffer(f);

		}, 
		populatePlayListByURLs: function(filelist) {
			for(var i = 0; i<filelist.length; i++) {
				var plObject = {
					"filename": filelist[i].name,
					"track": "unknown",
					"artist": "unknown",
					"url": filelist[i].name
				};
				jamdPL.push(plObject);
			}
		},
		populatePlaylistByFiles: function(filelist) {
			for(var i = 0; i<filelist.length; i++) {
				jamdPL.getId3(filelist[i], function(obj) {
					var plObject = {
						"filename": String(obj.fileObject.name),
						"track": String(obj.title),
						"artist": String(obj.artist),
						"url": String(window.URL.createObjectURL(obj.fileObject))
					};
					jamdPL.push(plObject);
				});
			}
		},
		add2Dom : function(obj) {
			var li = document.createElement('li');
			
			if(obj.artist == 'null') { 
				li.innerHTML = obj.filename;
			} else {
				li.innerHTML = obj.artist + " - " + obj.track;		
			}
  		li.setAttribute('data-src', obj.url);
  		li.setAttribute('draggable', 'true');
  		li.className = 'c2p';
			document.querySelector('#playlist').appendChild(li);
		},
		push : function(obj) {
			jamdPL.playlist.push(obj);
			if(pushTimeout) {
				clearTimeout(pushTimeout);
			}
			if(jamdPL.playlist.length > 0 ) {
				pushTimeout = setTimeout(function(){
					var plPushed = new CustomEvent('plPushed');
					document.dispatchEvent(plPushed);
				},500); 
			}
		},
		sortPL: function() {
			var arr = [];
			var newPL = [];
			for(var i = 0; i < currentFiles.length; i++) {
				var j = jamdPL.playlist.length;
				while(j--) {
					if( jamdPL.playlist[j].filename === currentFiles[i].name ) {
						newPL.push( jamdPL.playlist[j] );
						jamdPL.add2Dom( jamdPL.playlist[j] );
						jamdPL.playlist.splice(j,1);
						break;
					}
				}
			}
			if(jamdPL.playlist.length != 0) { 
				arr = jamdPL.playlist;
				arr = arr.concat(newPL); 
			} else { 
				arr = newPL; 
			}
			jamdPL.playlist = arr;
		},
		selectThis: function(e) {
			var src = e.target.getAttribute('data-src');
			d.querySelector('#ap').setAttribute('src', src);

			var arr = d.querySelectorAll('.c2p');
			for(var i=0;i<arr.length;i++){
				if(arr[i] == e.target){
					currentTrackIndex = i;
				}
				arr[i].classList.remove('playing');
			}
			e.target.classList.add('playing');
		},
		getCurrentTrackIndex: function() {
			return currentTrackIndex;
		},
		getCurrentMeta: function() {
			return jamdPL.playlist[currentTrackIndex];
		}, 
		previousTrack: function() {
			if(currentTrackIndex >= 1) {
				currentTrackIndex--;
				jamdPL.playTrack();
			}
		},
		nextTrack: function() {
			if(currentTrackIndex != jamdPL.playlist.length-1 ) {
				currentTrackIndex++;
				jamdPL.playTrack();					
			}
		},
		playTrack: function() {
			var src = jamdPL.playlist[currentTrackIndex].url;
			d.querySelector('#ap').setAttribute('src', src);
			var ap = d.querySelector('#ap');
			ap.play();
			var items = d.querySelectorAll('#playlist li');
			for (var i = 0; i < items.length; i++) {
				items[i].classList.remove('playing'); 
			}
			var selector =  '#playlist li:nth-child(' + (parseInt(currentTrackIndex)+1) + ')';
			d.querySelector(selector).classList.add('playing');
		}
	}
})();


jamdPL.init();
