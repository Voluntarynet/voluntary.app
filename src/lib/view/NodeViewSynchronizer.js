NodeViewSynchronizer = ideal.Proto.extend().newSlots({
	toNode: ideal.Map.clone(),	
	fromNode: ideal.Map.clone(),
	hasTimeout: false,
	isProcessing: false,	
}).setSlots({

	addToNode: function(aView) {
	    var uid = aView.uniqueId()
	    var map = this.toNode()
	    if (!map.hasKey(uid)) {
    	    map.atPut(uid, aView)
    	    this.setTimeoutIfNeeded()
        }
	    return this
	},
	
	addFromNode: function(aView) {
	    var uid = aView.uniqueId()
	    var map = this.fromNode()
	    if (!map.hasKey(uid)) {
    	    map.atPut(uid, aView)
    	    this.setTimeoutIfNeeded()
        }
	    return this	    
	},
	
	setTimeoutIfNeeded: function() {
        //console.log("processSyncs.setTimeoutIfNeeded")
	    if (!this.hasTimeout()) {
	        setTimeout(() => { 
	            this.setHasTimeout(false)
	            this.processSyncs() 
	        }, 0)
	    }
	    return this
	},
	
    processSyncs: function() {
        //console.log("processing NodeView syncs")
        this.setIsProcessing(true)
        
        var error = null
        try {
            var toNode = this.toNode()
            this.setToNode(ideal.Map.clone())
            
            var fromNode = this.fromNode()
            this.setFromNode(ideal.Map.clone())

            console.log("syning NodeViews " + toNode.size() + "-toNode and " + fromNode.size() + "-fromNode")
            
            toNode.forEach((uid) => {
                var aView = toNode.at(uid)
                aView.syncToNode()
            })
            
            fromNode.forEach((uid) => {
                var aView = fromNode.at(uid)
                aView.syncFromNode()
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
})
