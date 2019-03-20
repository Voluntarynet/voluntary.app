"use strict"

/*

    Some categories for json, sha256, buffer
    
*/

Object.toJsonStableString = function(obj) {
    return JSON.stableStringify(obj, null, 2)
}

Object.toStableHash = function(obj) {
    return Object.toJsonStableString(obj).sha256String();
}

String.prototype.toJsonDict = function() {
    return JSON.parse(this)
}

String.prototype.sha256String = function() {
    let h1 = bitcore.crypto.Hash.sha256(this.toBuffer()).toString("hex")
    //let h2 = bitcore.crypto.Hash.sha256(("" + this).toBuffer()).toString('hex')
    //assert(h1 === h2)
    return h1
/*
	let s = "" + this
	console.log("String.prototype.sha256String this = " + typeof(s) + " '" + s + "'")
	let shaBits = sjcl.hash.sha256.hash(s);
	let shaHex = sjcl.codec.hex.fromBits(shaBits);
    let h2 = bitcore.crypto.Hash.sha256(this.toBuffer()).toString('hex')
	console.log("shaHex = ", shaHex)
	console.log("h2 = ", h2)
	assert(shaHex === h2)
    return shaHex;             
*/   
}

String.prototype.toBuffer = function () {
    return new Buffer(this, "binary")
}

