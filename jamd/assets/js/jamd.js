var jamd = (function(){
	var d = document;
	var ap = d.getElementById('ap');
	var bufferInterval, fadeInterval;
	var currentVolume = ap.volume;
	var userPressedPlayed, muted = false;
	var cueMark = 0;

	// Private functions
	var getNiceTime = function(timeSlice) {
		var time = timeSlice;
		var h, m, s = 0;

		//Minutes
		m = Math.floor(time/60);
		if(m < 10) { m = "0" + m; }

		//Seconds
		s = (time%60).toFixed(2);
		if(s < 10) { s = "0" + s;}
		if(s == 60) {s = "00"; }
		s = s.replace('.', ':');

		//Final output
		outputTime = m + ':' + s;
		return outputTime;
	}

	// Public functions
	return {
		init: function() {
			jamd.attachListeners();
			//Initialize track if metadata fails to load before 1 second;
			//setTimeout(function() { jamd.initTrack(); }, 1000);	
		},
		attachListeners: function() {
			d.querySelector('#play').addEventListener('click', function() { jamd.togglePlayPause(); });
			d.querySelector('#seekForward').addEventListener('click', function() { jamd.seekForward(); }); 
			d.querySelector('#seekBackward').addEventListener('click', function() { jamd.seekBackward(); }); 
			d.querySelector('#nextTrack').addEventListener('click', function() { jamd.nextTrack(); }); 
			d.querySelector('#previousTrack').addEventListener('click', function() { jamd.previousTrack(); }); 
			d.querySelector('.volumeSlider').addEventListener('change', function(e) { jamd.volumeSet( d.querySelector('.volumeSlider').val() / 100 ); });
			d.querySelector('.pitchSlider').addEventListener('change', function(e) { jamd.pitchSet( d.querySelector('.pitchSlider').val() / 100 ); });
			d.querySelector('.trackProgress').addEventListener('change', function(e) { jamd.seek(e); })
			d.querySelector('#ap').addEventListener('loadedmetadata', function() { jamd.initTrack(); });
			d.querySelector('#ap').addEventListener('timeupdate', function() { jamd.updateTimer(); });
			d.querySelector('#ap').addEventListener('ended', function() { jamd.trackEnded(); });
			d.addEventListener('keydown', function(e) { jamd.keyPress(e); });
			d.addEventListener('keyup', function(e) { 
				if(e.which == '67') {
					ap.pause();
					ap.currentTime = cueMark;
					jamd.updateTimer();
				}
			});

			
		
		},
		initTrack: function() {
			//Display id3 or Name of file 
			if(jamdPL) {
				var obj =  jamdPL.getCurrentMeta();
				var string = String(obj.artist + " - " + obj.track);
				d.querySelector('#description').innerHTML = string;
			} else {
				var fileName = d.querySelector('#ap').attr('src');
				d.querySelector('#description').innerHTML = decodeURIComponent(fileName);
			}
			d.querySelector('#duration').innerHTML = "/ " + getNiceTime(ap.duration);

			//Update track progress slider with max value
			var maxVal = (ap.duration * 100).toFixed(0);
			d.querySelector('.trackProgress').setAttribute('max', maxVal);
			cueMark = 0;

		},
		startBufferingMeter: function() {
			bufferInterval = setInterval(function() {
				jamd.updateBuffer();
			},500);
		},
		updateBuffer: function() {
			if(d.querySelector('#ap').getAttribute('src') != '') {
				var buffered, duration, bufferedProgess;
				buffered = ap.buffered.end(0);
				duration = ap.duration;
				bufferProgress = ( ( buffered / duration ) * 100 );
				d.querySelector('#buffer').style.width = bufferProgress + "%";
				if(bufferProgress == 100) {
					clearInterval(bufferInterval);
				}
			}
		},
		updateTimer: function() {
			d.querySelector('#time').innerHTML = getNiceTime(ap.currentTime);
			d.querySelector('.trackProgress').value = ap.currentTime * 100;
		},

		//Player Events
		togglePlayPause: function() {
			if(!userPressedPlayed) { 
				userPressedPlayed = true; 
				jamd.startBufferingMeter();
			}
			if(ap.paused) {
				ap.play();
				roverJS.go('Play');
			} else {
				roverJS.go('Pause');
				ap.pause();
			}
		},
		trackEnded:function() {
			if(jamdPL) {
				jamdPL.nextTrack();
			}
		},

		//Seek
		seek: function(e) {
			ap.currentTime = parseInt(d.querySelector('.trackProgress').val()) / 100; 
			jamd.updateTimer();
		},
		seekForward: function(i) {
			if(typeof i === 'number') {
				ap.currentTime += 60;
			} else {
				ap.currentTime += 5;
			}
			jamd.updateTimer();
		},
		seekBackward: function(i) {
			if(typeof i === 'number') {
				ap.currentTime -= 60;
			} else {
				ap.currentTime -= 5;
			}
			jamd.updateTimer();
		},
		nextTrack: function() {
			if(jamdPL) {
				jamdPL.nextTrack();
			}
		},
		previousTrack: function() {
			if(jamdPL) {
				jamdPL.previousTrack();
			}
		},
		// Volume
		volumeSet:function(inVolume) {
			ap.volume = Math.round(inVolume*100)/100;
			var volume = (ap.volume *100).toFixed(0);
			var volStr = 'Volume ' + volume + '%';
			d.querySelector('.volumeSlider').value = volume;
			d.querySelector('#volumeLevel').innerHTML = volStr;
			roverJS.go(volStr);
		},
		pitchSet:function(inPitch) {
			ap.playbackRate = Math.round(inPitch*100)/100;
			var playbackRate = (ap.playbackRate *100).toFixed(0);
			d.querySelector('.pitchSlider').value = playbackRate;
			var string = "Speed: ";
			if(playbackRate == 100 ) { string += '+- 0'; }
			if(playbackRate >100) { string += '+' + (playbackRate-100); }
			if(playbackRate <100) { string += '-' + (playbackRate-100); }
			d.querySelector('#pitchLevel').innerHTML = string;
		},
		toggleMute: function() {
			if(!muted) {
				muted = true;
				currentVolume = ap.volume;
				jamd.volumeSet(0);
			} else {
				muted = false;
				jamd.volumeSet(currentVolume);
			}
		},
		fade: function() {
			fadeInterval = setInterval(function() {
				if(ap.volume > 0) {
					var volume = ap.volume - 0.05; 
					jamd.volumeSet(volume);
				} else {
					clearInterval(fadeInterval);
					if(!ap.paused) {
						jamd.togglePlayPause();	
					}
				} 
			}, 100);
		},
		openUrl: function() {
			var blob = "https://www.youtube.com/e911c9ba-f8cb-42d4-bde5-e362a9697a77";
			console.log(blob);
			ap.src = "http://solid.it.cx/Audio/Arctic%20Monkeys/Arctic%20Monkeys%20-%20Bigger%20Boys%20And%20Stolen%20Sweethearts.mp3";
		},
		// Keyboard events
		keyPress: function(e) {
			//console.log(e.which);
			switch(e.which) {
				case 32: //Spacebar
					e.preventDefault();
					jamd.togglePlayPause();
					break;
				case 37: //Left Arrow
					(e.shiftKey ? jamd.seekBackward(1) : jamd.seekBackward() );
					break;
				case 39: //Right Arrow
					(e.shiftKey ? jamd.seekForward(1) : jamd.seekForward() );
					break;
				case 189: //Minus					
					if(ap.volume > 0.00) { 
						var volume = ap.volume - 0.05; 
						jamd.volumeSet(volume);
					}
					break;
				case 187: //Plus
					if(ap.volume < 1.00) { 
						var volume = ap.volume + 0.05; 
						jamd.volumeSet(volume);
					}
					break;
				case 77: // "m"
					jamd.toggleMute();
					break;
				case 79: // "o"
					jamd.openUrl();
					break;
				case 78: // "n" 
				case 190:
					jamdPL.nextTrack();
					break;
				case 80:
				case 188: // "p"
					jamdPL.previousTrack();
					break;
				case 220: // "\" Reset Pitch
					jamd.pitchSet(1);
					break;
				case 221: // "]" +1 Pitch
					if(ap.playbackRate < 1.49) {
						var playbackRate = ap.playbackRate + 0.01;
						jamd.pitchSet(playbackRate);
					}
					break;	
				case 219: // "[" -1 Pitch
					if(ap.playbackRate > .49) {
						var playbackRate = ap.playbackRate - 0.01;
						jamd.pitchSet(playbackRate);
					}
					break;	
				case 90: // "z" begiinning of track
					ap.currentTime = cueMark = 0;
					jamd.updateTimer();
					break;
				case 67: // 'c' cue
					if(ap.paused) {
						ap.currentTime = cueMark;
						ap.play();	
					}
					break;
				case 88: // 'x' cue mark
					cueMark = ap.currentTime;
					//console.log("marked at: " + cueMark);
					break;
				case 70: // 'f' fade
					jamd.fade();
 			}
		}

	}
})();

window.onload = function(){
	jamd.init();	
};

