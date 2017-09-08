
SyncScheduler = ideal.Proto.extend().newSlots({
    type: "SyncScheduler",

    /*
        expected syncMethods:
    
            // store
        	syncToStore

            // node
        	syncToView
        	syncFromView

            // view
        	syncToNode	
        	syncFromNode
        	
        example use:
        
        SyncScheduler.scheduleTargetToSync(this, "syncToView")
	*/
	
	syncSets: ideal.Map.clone(),
	
	hasTimeout: false,
	isProcessing: false,	
	debug: true,
}).setSlots({
    
    syncSet: function(syncMethod) {
        var sets = this.syncSets()
        if (!sets.at(syncMethod)) {
            sets.atPut(syncMethod, ideal.Map.clone())
        }
        return sets.at(syncMethod)
    },

    scheduleTargetToSync: function(target, syncMethod) {
    	//console.log("scheduleTargetToSync target = ", target) 
        this.syncSet(syncMethod).atPut(target.typeId(), target)
    	this.setTimeoutIfNeeded()
    },
	
	setTimeoutIfNeeded: function() {
	    if (!this.hasTimeout()) {
            this.setHasTimeout(true)
	        setTimeout(() => { 
	            this.setHasTimeout(false)
	            this.processSets() 
	        }, 0)
	    }
	    return this
	},
	
	clear: function() {
	    this.setSyncSets(ideal.Map.clone())
	    return this
	},
	
    processSets: function() {
		assert(!this.isProcessing())
        this.setIsProcessing(true)
        
        var error = null
        try {
            //console.log(this.description())
            console.log(this.type() + ".processSets()")

            var sets = this.syncSets()
            this.clear()
            
            sets.forEach((syncMethod) => {
                var set = sets.at(syncMethod)
                set.forEach((key) => {
                    var target = set.at(key)
    				if (this.debug()) { 
    				    console.log("    " + target.typeId() + "." + syncMethod + "()") 
    				}
    				if (!target[syncMethod]) {
    				    //console.log("target = ", target) 
    				    //console.log(target.typeId() + "." + syncMethod + "() missing method") 
    				}
                    target[syncMethod].apply(target)
                })
            })

        } catch (e) {
            error = e
        } 
        
        this.setIsProcessing(false)
        
        if (error) {
            throw error
        }
        
        return this
    },

	description: function() {
		var parts = []
        var sets = this.syncSets()
        
        console.log("sets.size() = ", sets.size())
        sets.forEach((syncMethod) => {
            var n = sets.at(syncMethod).size()
            if (n) {
			    parts.push("    " + n + "-" + syncMethod + "")
		    }
        })
		
		return this.type() + ":\n" + parts.join("\n")
	},
})
