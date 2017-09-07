NodeViewSynchronizer = ideal.Proto.extend().newSlots({
    type: "NodeViewSynchronizer",
	toNode: ideal.Map.clone(),	
	fromNode: ideal.Map.clone(),
	hasTimeout: false,
	isProcessing: false,	
	debug: false,
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
	    if (!this.hasTimeout()) {
            this.setHasTimeout(true)
	        setTimeout(() => { 
	            this.setHasTimeout(false)
	            this.processSyncs() 
	        }, 0)
	    }
	    return this
	},
	
    processSyncs: function() {
		assert(!this.isProcessing())
        this.setIsProcessing(true)
        
        var error = null
        try {
            console.log(this.type() + " " + this.description())

            var toNode = this.toNode()
            this.setToNode(ideal.Map.clone())
            
            var fromNode = this.fromNode()
            this.setFromNode(ideal.Map.clone())

            
            toNode.forEach((uid) => {
                var aView = toNode.at(uid)
				if (this.debug()) { console.log(aView.typeId() + ".syncToNode()") }
                aView.syncToNode()
            })
            
            fromNode.forEach((uid) => {
                var aView = fromNode.at(uid)
				if (this.debug()) { console.log(aView.typeId() + ".syncFromNode()") }
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

	description: function() {
		//console.log("this.toNode().size() = ", this.toNode().size())
		//console.log("this.fromNode().size() = ", this.fromNode().size())
		var s = ""
		var n = this.toNode().size()
        if (n) { 
			s += (n + " syncViewToNodes")
		}
		
		var n = this.fromNode().size()
        if (n) { 
			s += (" " + n + " syncViewFromNodes")
		}
		
		return s
	},
})
