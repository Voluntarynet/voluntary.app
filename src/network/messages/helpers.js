"use strict"


Object.prototype.toJsonStableString = function() {
    return JSON.stableStringify(this, null, 2)
}

Object.prototype.toStableHash = function() {
    return this.toJsonStableString().sha256String();
}

String.prototype.toJsonDict = function() {
    return JSON.parse(this)
}

String.prototype.sha256String = function() {
	var h1 = bitcore.crypto.Hash.sha256(this.toBuffer()).toString('hex')
	//var h2 = bitcore.crypto.Hash.sha256(("" + this).toBuffer()).toString('hex')
	//assert(h1 == h2)
	return h1
/*
	var s = "" + this
	console.log("String.prototype.sha256String this = " + typeof(s) + " '" + s + "'")
	var shaBits = sjcl.hash.sha256.hash(s);
	var shaHex = sjcl.codec.hex.fromBits(shaBits);
    var h2 = bitcore.crypto.Hash.sha256(this.toBuffer()).toString('hex')
	console.log("shaHex = ", shaHex)
	console.log("h2 = ", h2)
	assert(shaHex == h2)
    return shaHex;             
*/   
}

String.prototype.toBuffer = function () {
    return new Buffer(this, "binary")
}

