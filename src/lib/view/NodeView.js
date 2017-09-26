
NodeView = DivView.extend().newSlots({
    type: "NodeView",
    node: null,
    ownsView: true,
    defaultSubnodeViewClass: null,
}).setSlots({
    
    // -------------------------------------
    
    init: function () {
        DivView.init.apply(this)
        //this._nodeObservation = NotificationCenter.shared().newObservation().setName("didUpdateNode").setObserver(this)
        this._nodeObservation = NotificationCenter.shared().newObservation().setObserver(this) // observe all
        return this
    },
	
    setNode: function(aNode) {
        if (this._node != aNode) {
            this.stopWatchingNode()
            this._node = aNode
            this.startWatchingNode()
            
            if (aNode && this.ownsView()) { 
                //this.log(aNode.type() + " setView")
                aNode.setView(this) 
            }

			var nodeId = aNode ? this.node().type() + "-" + this.node().uniqueId() : "null"
			this.element().id = this.type() + "-" + this._uniqueId + " for node " + nodeId
        }
		
        return this
    },
 
    startWatchingNode: function() {
        if (this._node) {
            //console.log("startWatchingNode " + this._node + " observation count = " + NotificationCenter.shared().observations().length)
            this._nodeObservation.setTarget(this._node._uniqueId).watch()
        }
        return this
    },
       
    stopWatchingNode: function() {
        if (this._node) {
            //console.log("stopWatchingNode " + this._node + " observation count = " + NotificationCenter.shared().observations().length)
            this._nodeObservation.stopWatching()
        }
        return this
    },
    
    willRemove: function() {
        DivView.willRemove.apply(this)
        this.stopWatchingNode()
        return this
    },
    
    subviewProto: function() {
        //console.log("looking for subviewProto")
        if (this.node()) {
            var vc = this.node().nodeRowViewClass()
            if (vc) { 
                return vc
            }
        }
        return DivView.subviewProto.apply(this)
    },

	// --- syncing ---
    
    subviewForNode: function(aNode) {
        return this.subviews().detect((aView) => { return aView.node() == aNode; })
    },

    newSubviewForSubnode: function(aSubnode) {
		var proto = aSubnode.viewClass()
		
		if (!proto) {
			//proto = this.defaultSubnodeViewClass()
		}
				
        if (!proto) {
            throw new Error("missing proto view to create " + aNode.type() + " view")
        }

		return proto.clone().setNode(aSubnode).setParentView(this)
    },
    
    syncFromNode: function () {
        // only replace subviews if sync requires it
        
        if (!this.node()) { 
            this.removeAllSubviews();
            return
        }
        
        this.node().prepareToSyncToView()
       
        var newSubviews = []
        var subnodes = this.node().subnodes()
        
		subnodes.forEach((subnode) => {
            var subview = this.subviewForNode(subnode) // get the current view for the node, if there is one
            
            if (!subview) {
                subview = this.newSubviewForSubnode(subnode)
			}
            
            if(subview == null) {
                throw new Error("null subview")
            }
            
            newSubviews.push(subview)   
        })
        
        if (!newSubviews.isEqual(this.subviews())) {
            this.removeAllSubviews()
            this.addSubviews(newSubviews)
        }

		this.subviews().forEach((subview) => { subview.syncFromNode() })

        return this
    },
    
    syncToNode: function () {
        var node = this.node()
        if (node) {
            node.didUpdateNode()
            //node.scheduleSyncToStore()
        }
        return this
    },

    didUpdateNode: function () {
        //console.log(this.type() + " didUpdateNode " + this.node().type())
        this.scheduleSyncFromNode()
    },
    
    scheduleSyncToNode: function() {
        //NodeViewSynchronizer.addToNode(this)  
        SyncScheduler.scheduleTargetAndMethod(this, "syncToNode")
        return this
    },
    
    scheduleSyncFromNode: function() {
        //NodeViewSynchronizer.addFromNode(this)    
        SyncScheduler.scheduleTargetAndMethod(this, "syncFromNode")
        return this
    },

	// logging 
    
    logName: function() {
        return this.type()
    },
    
    log: function(msg) {
        var s = "[" + this.logName() + "] " + msg
        console.log(s)
        return this
    },
    
    onDropFiles: function(filePaths) {
        var node = this.node()
        if (node && node.onDropFiles) {
            node.onDropFiles(filePaths)
        }
        return this
    },
    
})
