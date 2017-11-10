
NodeView = DivView.extend().newSlots({
    type: "NodeView",
    node: null,
    ownsView: true,
    defaultSubnodeViewClass: null,
    overrideSubviewProto: null,
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
			this.didChangeNode()
        }
		
        return this
    },
    
    didChangeNode: function() {
        this.scheduleSyncFromNode()
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

    subviewProtoForSubnode: function(aSubnode) {
		var proto = this.overrideSubviewProto()
		
		if (!proto) {
		    proto = aSubnode.viewClass()
		}
		
		/*
        if (!proto) {
		    proto = this.defaultSubnodeViewClass()
		}
		*/
				
        return proto      
    },

    
    newSubviewForSubnode: function(aSubnode) {
        if (!aSubnode) {
            throw new Error("null aSubnode")
        }
        
		var proto = this.subviewProtoForSubnode(aSubnode)
		
		if (!proto) {
            throw new Error("no subviewProto for subnode " + aSubnode.typeId())
		}
		
		return proto.clone().setNode(aSubnode) //.setParentView(this)
    },
    
    visibleSubnodes: function() {
        return this.node().subnodes()
    },
    
    syncFromNode: function () {
        // only replace subviews if sync requires it
        
        if (!this.node()) { 
            this.removeAllSubviews();
            return
        }
        
        this.node().prepareToSyncToView()
       
        var newSubviews = []
        var subnodes = this.visibleSubnodes()
        
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
    
    // visibility
    
	onVisibility: function() {
	    DivView.onVisibility.apply(this)
	    //console.log(this.typeId() + ".onVisibility()")
	    var node = this.node()
	    if (node && node.nodeBecameVisible) {
	        node.nodeBecameVisible()
	    }

	    return this
	},
	
    
})
