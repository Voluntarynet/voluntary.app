/*

    find pow:
    
        var pow = BMPow.clone().setInHashHex(hh).findPow()
        console.log("found pow = ", pow.powHex())
    
    verify pow:

        var isValid = BMPow.clone().setInHashHex(hh).setPowHex(ph).isValid()
        console.log("pow is valid = ", isValid)    
        
    notes:
    
        setDifficulty() method available
*/


const assert = require('assert');
const BitArray = require('node-bitarray')
const crypto = require('crypto');

BMPow = BMNode.extend().newSlots({
    type: "BMPow",
    difficulty: 1,
    diffBits: null,
    inBits: null,
    powBits: null,
    tries: 0,
    startRand: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setTitle("BMPow")
    },
    
    // diff
    
    setDifficulty: function (bitCount) {
        this._difficulty = bitCount
        this.setupDiffBits()
        return this
    },
    
    setupDiffBits: function () {
        var max = 256
        var d = this.difficulty()
        var s = "1".repeat(d) + "0".repeat(max - d)
        assert(s.length == max)
        this.setDiffBits(new Buffer(s, 'binary'))
        return this
    },
    
    // in hash
    
    setInHashHex: function(hexString) {
        console.log("setInHashHex '" + hexString + "'")
        this._inBits = BitArray.fromBuffer(new Buffer(hexString, 'hex'))
        return this
    },
    
    // pow
    
    setPowHex: function(hexString) {
        this.setPowBits(BitArray.fromBuffer(new Buffer(hexString, 'hex')))
        return this
    },
    
    powHex: function() {
        return this.powBits().toBuffer().toHex()
    },
    
    findPow: function () {
        while(!this.tryToFindPow(10000)) {
        }
        
        return this
    },
    
    startRand: function() {
        if (!this._startRand) {
            this._startRand = Math.random()
        }
        return this._startRand
    },
    
    tryToFindPow: function (iters) {
        if (!iters) { iters = 1 }
        for (var i = 0; i < iters; i ++) {
            var rand256bits = BitArray.fromBuffer(crypto.randomBytes(32)) // 32bytes = 256bits
            this.setPowBits(rand256bits)
            if (this.isValid()) {
                this._tries += i
                return true
            }
        }
        this._tries += i
        return false
    },
    
    // valid
    
    isValid: function () {
        var inBits = BitArray.fromBuffer(this.inBits())
        console.log("inBits.length = " + inBits.length)
        //assert(inBits.length == 256)
        
        // XOR hash and pow 
        var xorBuf = inBits.xor(this.powBits()).toBuffer()
        var outBits = BitArray.fromBuffer(bitcore.crypto.Hash.sha256(xorBuf))
        console.log("outBits.length = " + outBits.length)
        //assert(outBits.length == 256)
        
        var diffBits = this.diffBits()
        console.log("diffBits.length = " + diffBits.length)
        //assert(diffBits.length == 256)
        
        // AND result with difficulty to see if all difficulty 1 bits are 1 in result
        var isValid = BitArray.fromBuffer(outBits).and(diffBits).equals(diffBits)  
        return isValid      
    },
    
    show: function () {
        
    },

})
