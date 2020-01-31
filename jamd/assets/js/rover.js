var roverJS = (function() {
	return {
		init: function() {
			//console.log('roverJS init');
		},
		go: function(text) {
			document.querySelector('#over').innerHTML = text;
			document.querySelector('#over').classList.add('go');
			setTimeout(function(){
				document.querySelector('#over').classList.remove('go');
			},500);
		}
	}

})();

roverJS.init();