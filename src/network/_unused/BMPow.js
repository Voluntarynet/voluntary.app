
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

"use strict"

window.BMPow = ideal.Proto.extend().newSlots({
    type: "BMPow",
    targetDifficulty: 15,
    hash: null, // hex string
    //pow: null, // hex string
    powBits: null, // bitArray
    
    // finding
    tries: 0,

    isFinding: false,
    updateCallback: null,
    doneCallback: null,
    
    asyncEndTime: null,
    asyncTimeoutPeriod: 10*60*1000,
    
    syncEndTime: null,
    syncTimeoutPeriod: 100,
    syncTriesPerLoop: 2000,
    status: null,
    globalEstimateTriesPerMs: null, // set this 
    doneCallback: null,
    isValid: null, // used to cache result, null means "don't know yet"
}).setSlots({
    init: function () {
        this.setTargetDifficulty(BMMessages.globalMinDifficulty())
        this.pickRandomPow()
        this._updateNote = NotificationCenter.shared().newNote().setSender(this).setName("powUpdate")
        this._doneNote = NotificationCenter.shared().newNote().setSender(this).setName("powDone")
    },
        
    pickRandomPow: function() {
        var numBytes = 32;
        this.setPowBits(sjcl.random.randomWords(numBytes/4));
        return this        
    },
    
    powHex: function() {
        return sjcl.codec.hex.fromBits(this.powBits());
    },
    
    setPowHex: function(powHex) {
        this.setPowBits(sjcl.codec.hex.toBits(powHex));
        return this
    },
    
    setPowBits: function(bits) {
        this._powBits = bits
        this.setIsValid(null)
        return this
    },
    
    status: function() {
        if (this._status != null) {
            return this._status;
        }
        
        if (this.isValid()) {
            //return this.highlightString("level " + this.actualPowDifficulty() + " Stamp &nbsp;&#10003;")
            //return "valid level " + this.highlightString(this.actualPowDifficulty()) + " Stamp" // &nbsp; &#10003;"
            return "level " + this.actualPowDifficulty() + " Stamp" // &nbsp; &#10003;"
        }
        
        //console.log("status invalid")
        
        return "generate level " + this.highlightString(this.targetDifficulty()) + " stamp in about " + this.estimateTimeDescription() + ""
    },
    
    asyncFind: function () {
        this.setStatus("starting")
        var currentTime = new Date().getTime()
        this.setAsyncEndTime(currentTime + this.asyncTimeoutPeriod())
        if (!this.isFinding()) {
            this.setIsFinding(true)
            this._tries = 0
            this.PRIVATE_findPowLoop()
        }
    },
    
    stopFindingPow: function() {
        this.setIsFinding(false);
    },

    asyncTimedOut: function() {
        var currentTime = new Date().getTime()
        return currentTime > this.asyncEndTime()        
    },
    
    PRIVATE_findPowLoop: function() {
        var found = this.syncFind() // sync has a timeout period
        
        if (this.asyncTimedOut()) {
            throw new Error("Pow asyncTimedOut " + new Date().getTime() + " > "  + this.asyncEndTime())
        }
        
        if (found) {
            console.log("BMPow: found targetDifficulty " + this.actualPowDifficulty() + " pow after " + this.tries() + " tries")
            this.show()
            this.setIsFinding(false)
            this.setStatus(null)
            if (this.doneCallback()) { 
                this.doneCallback().apply() 
            }
            this._doneNote.post()                
        } else {
            if (this.isFinding()) {
                this.setStatus("generating level " + this.targetDifficulty() + " stamp... " + this.highlightString(this.estimatedPercentageDone() + "%"))               
                this._updateNote.post()
                setTimeout(() =>{ 
                    this.PRIVATE_findPowLoop()
                }, 100);
            } 
        } 
    },

    syncFind: function() {
        var syncEndTime = new Date().getTime() + this.syncTimeoutPeriod()
        var done = false;
        do {
            done = this.syncFindOneLoop()
            var currentTime = new Date().getTime()
            var syncTimedOut = currentTime > syncEndTime;
        } while (!done && syncTimedOut);
        
        return done
    },
    
    syncFindOneLoop: function() {
        var max = this.syncTriesPerLoop();
        for (let i = 0; i < max; i++) {
            this.pickRandomPow()
            if (this.isValid()) {
                this._tries += i;
                return true;
            }
        }
        this._tries += max;
        return false
    },
    
    /*
    estimatedTime: function() {
    
    }
    */
    
    estimateDifficultyForTimeout: function(dtInMiliiseconds) {
        // dt = (2 ^ diff)/triesPerMs so: Log2(dt * triesPerMs) = diff
        return Math.log2(dtInMiliiseconds * BMPow.globalEstimateTriesPerMs());
    },
 
    estimatedPercentageDone: function() {
        var p = this.estimatedRatioDone()*100
        if (p < 1) { 
            return Math.floor(p*100)/100
        }
        return Math.floor(p)
    },
       
    estimatedRatioDone: function() {
        return this.tries() / this.estimatedTriesForTargetDifficulty()
    },
    
    estimatedTriesForTargetDifficulty: function() {
        return Math.pow(2, this.targetDifficulty())
    },
    
    estimateTimeInMsForTargetDifficulty: function() {
        // dt = (2 ^ diff)/triesPerMs
        return this.estimatedTriesForTargetDifficulty() / BMPow.globalEstimateTriesPerMs()
    },

    highlightString: function (s) { 
        return "<span style='color:#444;'>" + s + "</span>"; 
    },
    
    estimateTimeDescription: function() {
        var value = null
        var unit = null
        
        var secs = this.estimateTimeInMsForTargetDifficulty()/1000
        value = Math.floor(secs) 
        unit = "seconds"
        
        var mins = secs / 60
        if (mins > 1) {
            value = Math.floor(mins)
            unit = "minutes"
        }
         
        var hours = secs / (60*60)
        if (hours > 1) {
            value = Math.floor(hours*10)/10;
            unit = "hours"
        }
        
        return this.highlightString(value) + " " + unit
    },
    

    maxDifficulty: function() {
        return 32 * 8
    },
    
    globalEstimateTriesPerMs: function() {
        if (this._globalEstimateTriesPerMs == null) {
            var pow = BMPow.clone()
            pow.setTargetDifficulty(this.maxDifficulty()) // to make sure we don't find it
            this.setTries(0)
            pow.syncFind()
            this._globalEstimateTriesPerMs = pow.tries() / pow.syncTimeoutPeriod()
        }
        return this._globalEstimateTriesPerMs
    },
    
    /*
    findPowSync: function () {   
        // not efficient but simple and we can cache the bufs later
        var tries = 0;
        while (tries < this._maxTries) {
            tries ++;
            this._totalTries ++;
            //console.log("findPow try " + tries)
            this.pickRandomPow()
            if (this.isValid()) {
                console.log("found valid pow at targetDifficulty " + this.targetDifficulty() + " after " + tries + " tries")
                this.show()
                return true;
            }
            //this.show()
        }
        
        return false
    },
    */
    
    hashBits: function() {
        return sjcl.codec.hex.toBits(this.hash());
    },
    
    catShaBits: function() {
        var catBits  = sjcl.bitArray.concat(this.hashBits(), this.powBits());
        return sjcl.hash.sha256.hash(catBits);
    },
    
    leftZeroBitCount: function() {
        return sjcl.codec.bits.leftZeroBitCount(this.catShaBits());
    },
    
    setHash: function(v) {
        if (this._hash != v) {
            this._hash = v
            this._isValid = null
        }
        return this
    },
    
    actualPowDifficulty: function() {
        if (this.hash() == null || this.powBits() == null) {
            return 0
        }
        return this.leftZeroBitCount()    
    },
    
    isValid: function () {
        if (this._hash == null) { 
            //console.warn("WARNING: null hash on BMPow")
            return false 
        }
            
        return this.actualPowDifficulty() >= this.targetDifficulty()
        
        /*
        if (this._isValid == null) {
            this._isValid = this.leftZeroBitCount() >= this.targetDifficulty();
        }
        
        return this._isValid 
        */
    },
    
    show: function () {
        console.log("BMPow show")
        console.log("          pow: '" + this.powHex() + "'")
        console.log("         hash: '" + this.hash() + "'")
        console.log("       catsha: '" + sjcl.codec.hex.fromBits(this.catShaBits()) + "'")
        console.log("   catshaBits: '" + sjcl.codec.bits.toBitString(this.catShaBits()).slice(0, this.targetDifficulty() + 10) + "...'")
        console.log("                " + "^".repeat(this.targetDifficulty()))
        console.log("  actual diff: " + this.actualPowDifficulty())
        console.log("  target diff: " + this.targetDifficulty())
        ///console.log("        tries: " + this.tries());
        console.log("      isValid: " + this.isValid() )
        return this
    },
    
    boundsCheckTargetDifficulty: function() {
        var d = this.targetDifficulty() 
        if (d < 0) { d = 0; }        
        if (d > this.maxDifficulty()) { d = this.maxDifficulty(); }  
        this.setTargetDifficulty(d)      
    },
    
    decrementDifficulty: function() {
        this.setTargetDifficulty(this.targetDifficulty() - 1)
        this.boundsCheckTargetDifficulty()
    },
    
    incrementDifficulty: function() {
        this.setTargetDifficulty(this.targetDifficulty() + 1)
        this.boundsCheckTargetDifficulty()
    },

})
