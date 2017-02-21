
/*

    find pow:
    
        var pow = BMPow.clone().setHash(hh).findPow()
        console.log("found pow = ", pow.powHex())
    
    verify pow:

        var isValid = BMPow.clone().setHash(hh).setPow(ph).isValid()
        console.log("pow is valid = ", isValid)    
        
    notes:
    
        setDifficulty() method available
*/

/*
var BitArray = require('node-bitarray')
var crypto = require('crypto');
var bitcore = require('bitcore-lib');
require('bufferjs')
*/

BMPow = ideal.Proto.extend().newSlots({
    type: "BMPow",
    difficulty: 4,
    hash: null, // hex string
    pow: null, // hex string
}).setSlots({
    init: function () {
    },
        
    pickRandomPow: function() {
        var powBuf = crypto.randomBytes(32)
        this.setPow(powBuf.toString('hex'))
        return this        
    },
    
    findPow: function () {        
        // not efficient but simple and we can cache the bufs later
        while (true) {
            this.pickRandomPow()
            if (this.isValid()) {
                //this.show()
                return true;
            }
        }
        
        return false
    },
        
    isValid: function () {
        // this is crude but still a working pow
        // use bit array and xor later

        var hashBuf = new bitcore.deps.Buffer(this.hash(), 'hex')
        var powBuf = new bitcore.deps.Buffer(this.pow(), 'hex')
        var catBuf = Buffer.concat([hashBuf, powBuf]);
        var catHashBuf = bitcore.crypto.Hash.sha256(catBuf)
        var catHash = catHashBuf.toString('hex')
        
        var diff = this.difficulty()
        var a = catHash.slice(0, diff)
        var b = this.hash().slice(0, diff)   
        //console.log(a + " =?= " + b)
        return a == b 
    },
    
    show: function () {
        console.log("BMPow show")
        console.log("  pow:  '" + this.pow() + "'")
        console.log("  hash: '" + this.hash() + "'")
        return this
    },

})
