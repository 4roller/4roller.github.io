self.addEventListener('message', function(e) {
	let data = e.data;
	switch(data.cmd) {
		case 'hi':
			self.postMessage(data.msg);
			break;
		case 'doSomething':
			let thing = 1/256;
			self.postMessage(thing);
            break;
        case 'sendImage':
            self.postMessage(data.msg);
            break;
        case 'destroy':
			self.postMessage('i have stopped ' + data.msg);
			self.close();
			break;
		default:
//			self.postMessage('default return ' + data.msg);
	};


}, false);

