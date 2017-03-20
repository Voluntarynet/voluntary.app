
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

BMPow = ideal.Proto.extend().newSlots({
    type: "BMPow",
    difficulty: 15,
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
        this.pickRandomPow()
        this._updateNote = NotificationCenter.shared().newNotification().setSender(this).setName("powUpdate")
        this._doneNote = NotificationCenter.shared().newNotification().setSender(this).setName("powDone")

    },
    
    /*
    status: function() {
        if (this.isFinding()) {
            return this.tries + " tries on pow difficulty " + this.difficulty()
        }
        
        return ""
    },
    */
        
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
            //return this.highlightString("level " + this.difficulty() + " Stamp &nbsp;&#10003;")
            //return "valid level " + this.highlightString(this.difficulty()) + " Stamp" // &nbsp; &#10003;"
            return "level " + this.difficulty() + " Stamp" // &nbsp; &#10003;"
        }
        
        //console.log("status invalid")
        
        return "generate level " + this.highlightString(this.difficulty()) + " stamp in about " + this.estimateTimeDescription() + ""
    },
    
    /*
    difficultyDescription: function() {
        var d = this.difficulty()
        var s = "th"
        
        if (d == 1) { s = "st"; }
        if (d == 2) { s = "nd"; }
        if (d == 3) { s = "rd"; }
        
        return d + s + " Level"
    },
    */
    
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
            console.log("BMPow: found difficulty " + this.difficulty() + " pow after " + this.tries() + " tries")
            this.show()
            this.setIsFinding(false)
            this.setStatus(null)
            if (this.doneCallback()) { 
                this.doneCallback().apply() 
            }
            this._doneNote.post()                
        } else {
            if (this.isFinding()) {
               this.setStatus("generating level " + this.difficulty() + " stamp... " + this.highlightString(this.estimatedPercentageDone() + "%"))               
               this._updateNote.post()
               var self = this
                setTimeout(function(){ 
                    self.PRIVATE_findPowLoop()
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
        for (var i = 0; i < max; i++) {
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
        return this.tries() / this.estimatedTries()
    },
    
    estimatedTries: function() {
        return Math.pow(2, this.difficulty())
    },
    
    estimateTimeInMsForDifficulty: function() {
        // dt = (2 ^ diff)/triesPerMs
        return this.estimatedTries() / BMPow.globalEstimateTriesPerMs()
    },

    highlightString: function (s) { 
        return "<span style='color:#444;'>" + s + "</span>"; 
    },
    
    estimateTimeDescription: function() {
        var value = null
        var unit = null
        
        var secs = this.estimateTimeInMsForDifficulty()/1000
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
    
    estimatedTriesForDifficulty: function() {
        return Math.pow(2, this.difficulty())
    },
    
    maxDifficulty: function() {
        return 32*8
    },
    
    globalEstimateTriesPerMs: function() {
        if (this._globalEstimateTriesPerMs == null) {
            var pow = BMPow.clone()
            pow.setDifficulty(this.maxDifficulty()) // to make sure we don't find it
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
                console.log("found valid pow at difficulty " + this.difficulty() + " after " + tries + " tries")
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
    
    makeDifficultyMatchPow: function() {
        this.setDifficulty(this.leftZeroBitCount())
        return this
    },
    
    actualDifficulty: function() {
        return this.leftZeroBitCount()    
    },
    
    isValid: function () {
        if (this._hash == null) { 
            //ShowStack();
            //console.log("WARNING: null hash on BMPow")
            return false 
        }
            
        return this.leftZeroBitCount() >= this.difficulty()
        
        /*
        if (this._isValid == null) {
            this._isValid = this.leftZeroBitCount() >= this.difficulty();
        }
        
        return this._isValid 
        */
    },
    
    show: function () {
        ShowStack()
        console.log("BMPow show")
        console.log("          pow: '" + this.powHex() + "'")
        console.log("         hash: '" + this.hash() + "'")
        console.log("       catsha: '" + sjcl.codec.hex.fromBits(this.catShaBits()) + "'")
        console.log("   catshaBits: '" + sjcl.codec.bits.toBitString(this.catShaBits()).slice(0,this.difficulty()+10) + "...'")
        console.log("   difficulty: " + this.difficulty())
        ///console.log("        tries: " + this.tries());
        console.log("      isValid: " + this.isValid() )
        return this
    },
    
    boundsCheckDifficulty: function() {
       var d = this.difficulty() 
       if (d < 0) { d = 0; }        
       if (d > this.maxDifficulty()) { d = this.maxDifficulty(); }  
       this.setDifficulty(d)      
    },
    
    decrementDifficulty: function() {
       this.setDifficulty(this.difficulty() - 1)
       this.boundsCheckDifficulty()
    },
    
    incrementDifficulty: function() {
       this.setDifficulty(this.difficulty() + 1)
       this.boundsCheckDifficulty()
    },

})
