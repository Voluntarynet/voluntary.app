"use strict"

window.SyncScheduler = ideal.Proto.extend().newSlots({
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
	debug: false,
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
    
    unscheduleTargetToSync: function(target, syncMethod) {
        this.syncSet(syncMethod).removeKey(target.typeId())
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
        var indent = "    "

        var error = null
        try {
            //console.log(this.description())
			if (this.debug()) { 
            	console.log("Sync")
			}
			
            var sets = this.syncSets()
            this.clear()
            
            sets.forEach((syncMethod) => {
                var set = sets.at(syncMethod)

   				if (this.debug()) { 
    				   console.log(indent + syncMethod) 
    			}

                set.forEach((key) => {
                    var target = set.at(key)

    				if (this.debug()) { 
    				    console.log(indent + indent + target.typeId()) 
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
