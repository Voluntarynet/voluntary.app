
NodeView = DivView.extend().newSlots({
    type: "NodeView",
    node: null,
    ownsView: true,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this._nodeObservation = NotificationCenter.shared().newObservation().setName("didUpdateNode").setObserver(this)
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
        if (this.node()) {
            var vc = this.node().nodeRowViewClass()
            if (vc) { 
                return vc
            }
        }
        return DivView.subviewProto.apply(this)
    },

	// --- syncing ---
    
    syncFromNode: function () {
        // only replace items if sync requires it
        
        if (!this.node()) { 
            this.removeAllItems();
            return
        }
        
        this.node().prepareToSyncToView()
       
        var newItems = []
        var subnodes = this.node().items()
        
		subnodes.forEach((subnode) => {
            var itemView = this.itemForNode(subnode) // get the current view for the node, if there is one
            
            if (!itemView) {
                itemView = this.newItemForNode(subnode).syncFromNode()
            } else {
                itemView.syncFromNode()
            }
            
            if(itemView == null) {
                throw new Error("null itemView")
            }
            
            newItems.push(itemView)      
        })
        
        if (!newItems.isEqual(this.items())) {
            this.removeAllItems()
            this.addItems(newItems)
        } else {
            //this.log(" view items equal")
        }

        return this
    },
    
    syncToNode: function () {
        var node = this.node()
        if (node) {
            node.didUpdate()
            node.markDirty()
        }
        return this
    },

	didChangeItemList: function() {
		DivView.didChangeItemList.apply(this)
		//this.markViewDirty()
		return this
	},
	
	markViewDirty: function() {
		if (this.isHandlingEvent()) {
			this.setNeedsSyncToNode(true)
		}		
	},

    didUpdateNode: function () {
        //console.log(this.type() + " didUpdateNode " + this.node().type())
        this.syncFromNode()
    },

    setNeedsSyncToNode: function(aBool) {
        if (this._needsSyncToNode == aBool) { 
            return this; 
        }
        
        //this.log("needsSyncToView " + this._needsSyncToView + " -> " + aBool)

        if (aBool && !this._needsSyncToNode) {
            //this.log(" >>> adding timer syncToView")
            
            setTimeout( () => { 
                this.syncToNode()
                this.log(" +++ fired syncToNode")
            }, 1)            
        }
        
        this._needsSyncToNode = aBool
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
