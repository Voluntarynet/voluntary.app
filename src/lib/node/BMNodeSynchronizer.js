BMNodeSynchronizer = ideal.Proto.extend().newSlots({
    type: "BMNodeSynchronizer",
	toView: ideal.Map.clone(),	
	fromView: ideal.Map.clone(),
	hasTimeout: false,
	isProcessing: false,	
	debug: false,
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

            var toView = this.toView()
            this.setToView(ideal.Map.clone())
            
            var fromView = this.fromView()
            this.setFromView(ideal.Map.clone())
            
            toView.forEach((uid) => {
                var aNode = toView.at(uid)
				if (this.debug()) { console.log(aNode.typeId() + ".syncToView()") }
                aNode.syncToView()
            })
            
            fromView.forEach((uid) => {
                var aNode = fromView.at(uid)
				if (this.debug()) { console.log(aNode.typeId() + ".syncFromView()") }
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

	description: function() {
		//console.log("this.toView().size() = ", this.toView().size())
		//console.log("this.fromView().size() = ", this.fromView().size())
		
		var s = ""
		var n = this.toView().size()
        if (n) { 
			s += n + " syncNodeToViews"
		}
		
		var n = this.fromView().size()
        if (n) { 
			s += " " + n + " syncNodeFromViews"
		}
		
		return s
	},
})
