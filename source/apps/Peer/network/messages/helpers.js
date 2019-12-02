"use strict"

/*

    Some categories for json, sha256, buffer
    
*/

Object.defineSlots(Object.prototype, {

    toJsonStableString: function(obj) {
        return JSON.stableStringify(obj, null, 2)
    },

    toStableHash: function (obj) {
        return Object.toJsonStableString(obj).sha256String();
    }

})

Object.defineSlots(String.prototype, {

    toJsonDict: function () {
        return JSON.parse(this)
    },

    sha256String: function () {
        const h1 = bitcore.crypto.Hash.sha256(this.toBuffer()).toString("hex")
        //const h2 = bitcore.crypto.Hash.sha256(("" + this).toBuffer()).toString('hex')
        //assert(h1 === h2)
        return h1
    /*
        const s = "" + this
        console.log("String.prototype.sha256String this = " + typeof(s) + " '" + s + "'")
        const shaBits = sjcl.hash.sha256.hash(s);
        const shaHex = sjcl.codec.hex.fromBits(shaBits);
        const h2 = bitcore.crypto.Hash.sha256(this.toBuffer()).toString('hex')
        console.log("shaHex = ", shaHex)
        console.log("h2 = ", h2)
        assert(shaHex === h2)
        return shaHex;             
    */   
    },

    toBuffer: function () {
        return new Buffer(this, "binary")
    }

})

