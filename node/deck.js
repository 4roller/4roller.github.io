// Big 2 - Deck
// 2013.04.10


var Deck = function() {
	this.deck = [	'd1','d2','d3','d4','d5','d6','d7','d8','d9','d10','dj','dq','dk',
								'c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','cj','cq','ck',
								'h1','h2','h3','h4','h5','h6','h7','h8','h9','h10','hj','hq','hk',
								's1','s2','s3','s4','s5','s6','s7','s8','s9','s10','sj','sq','sk'];
}

Deck.prototype = {

	shuffle : function() {
		var o = this.deck;
		var m = 0;

		while(m < 1000) {
			for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			this.deck = o;
			m++;
		}

	},

	dealCard: function() {
		if(this.deck.length !== 0) {
			return this.deck.pop();	
		}
	},

	getLength: function() {
		return this.deck.length;
	}

}


module.exports = Deck;


