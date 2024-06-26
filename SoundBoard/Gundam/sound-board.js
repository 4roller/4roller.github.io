var SoundBoard = (function() {

	var d, ap0, ap1, ap2, buttonWrapper, ap0Status, ap1Status;
	var addListeners = function() {
		console.log('Adding listeners ...');
		buttonWrapper.addEventListener('click', function(e) {
			e.preventDefault();
						
			if(ap0Status !== 'playing') {
				ap0.src = 'sounds/' + e.target.getAttribute('data-src');
				ap0.play();			
			} else if (ap1Status !== 'playing') {
				ap1.src = 'sounds/' + e.target.getAttribute('data-src');
				ap1.play();
			} else {
				ap2.src = 'sounds/' + e.target.getAttribute('data-src');
				ap2.play();
			}			
		});

		ap0.addEventListener('playing', function(e) {
			ap0Status = 'playing';			
		});
		ap0.addEventListener('ended', function(e) {
			ap0Status = 'stopped';
		});
		ap1.addEventListener('playing', function(e) {
			ap1Status = 'playing';			
		});
		ap1.addEventListener('ended', function(e) {
			ap1Status = 'stopped';
		});

	}

	return {
		init: function(){
			console.log('Sound Board initializing ...');
			
			d = document;
			ap0 = d.getElementById('ap0');			
			ap1 = d.getElementById('ap1');
			ap2 = d.getElementById('ap2');
			buttonWrapper = d.querySelector('.button-wrapper');
			addListeners();
		}
	}
})();

window.onload = function(){
	SoundBoard.init();	
};