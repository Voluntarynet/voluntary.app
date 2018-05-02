
"use strict"

window.BMServerMessage = ideal.Proto.extend().newSlots({
    type: "BMServerMessage",
    count: 0,
    serverConnection: null,
    id: null,
    name: null,
    data: null
}).setSlots({
	init: function() {
		ideal.Proto.init.call(this);
		BMServerMessage.setCount(BMServerMessage.count() + 1);
		this.setId(BMServerMessage.count().toString());
	},

	send: function() {
		const messageString = JSON.stringify({
			id: this.id(),
			name: this.name(),
			data: this.data()
		});

		console.log('BMServerMessage send: ' + messageString);

		this.serverConnection().pendingMessages()[this.id()] = this;
		this.serverConnection().serverConn().send(messageString);

		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
		});
	},

	resolve: function(value) {
		this._resolve(value);
	},

	reject: function(reason) {
		this._reject(reason);
	}
});