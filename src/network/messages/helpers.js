

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
	var shaBits = sjcl.hash.sha256.hash(this);
	var shaHex = sjcl.codec.hex.fromBits(shaBits);
    return shaHex;                
    //return bitcore.crypto.Hash.sha256(this.toBuffer()).toString('hex')
}

String.prototype.toBuffer = function () {
    return new Buffer(this, "binary")
}

