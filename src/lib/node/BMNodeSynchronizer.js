BMNodeSynchronizer = ideal.Proto.extend().newSlots({
	toView: ideal.Map.clone(),	
	fromView: ideal.Map.clone(),
	hasTimeout: false,
	isProcessing: false,	
	// BMNodeSynchronizer.addFromView(aNode)
}).setSlots({

	addToView: function(aNode) {
	    var uid = aNode.uniqueId()
	    var map = this.toView()
	    if (!map.hasKey(uid)) {
    	    map.atPut(uid, aNode)
    	    this.setTimeoutIfNeeded()
        }
	    return this
	},
	
	addFromView: function(aNode) {
	    var uid = aNode.uniqueId()
	    var map = this.fromView()
	    if (!map.hasKey(uid)) {
    	    map.atPut(uid, aNode)
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
            var toView = this.toView()
            this.setToView(ideal.Map.clone())
            
            var fromView = this.fromView()
            this.setFromView(ideal.Map.clone())

            console.log("syning Nodes " + toView.size() + "-toView and " + fromView.size() + "-fromView")
            
            toView.forEach((uid) => {
                var aNode = toView.at(uid)
                aNode.syncToView()
            })
            
            fromView.forEach((uid) => {
                var aNode = fromView.at(uid)
                aNode.syncFromView()
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
