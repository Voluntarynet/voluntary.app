"use strict"

/*

    NodeView

*/

window.NodeView = DivStyledView.extend().newSlots({
    type: "NodeView",
    node: null,
    //ownsView: true,
    overrideSubviewProto: null,
    nodeObservation: null,
}).setSlots({
    
    // -------------------------------------
    
    init: function () {
        DivStyledView.init.apply(this)
        //this.setNodeObservation(NotificationCenter.shared().newObservation().setName("didUpdateNode").setObserver(this))
        this.setNodeObservation(NotificationCenter.shared().newObservation().setObserver(this)) // observe all
        //this.setStyles(BMViewStyles.clone())
        return this
    },
	
	
    setNode: function(aNode) {

        if (this._node !== aNode) {

            this.stopWatchingNode()
            this._node = aNode
            this.startWatchingNode()

            this.updateElementIdLabel()
            this.didChangeNode()
        }
		
        return this
    },

    updateElementIdLabel: function() {
        const nodeId = this.node() ? this.node().type() + "-" + this.node().uniqueId() : "null"
        this.element().id = this.type() + "-" + this._uniqueId + " for node " + nodeId
    },
    
    didChangeNode: function() {
        if (this.node()) {
            this.scheduleSyncFromNode()
        }
        return this
    },
 
    startWatchingNode: function() {
        if (this.node()) {
            //console.log("startWatchingNode " + this.node() + " observation count = " + NotificationCenter.shared().observations().length)
            this.nodeObservation().setTarget(this.node()._uniqueId).watch()
        }
        return this
    },
       
    stopWatchingNode: function() {
        if (this.node()) {
            //console.log("stopWatchingNode " + this.node() + " observation count = " + NotificationCenter.shared().observations().length)
            this.nodeObservation().stopWatching()
        }
        return this
    },
    
    willRemove: function() {
        DivStyledView.willRemove.apply(this)
        this.stopWatchingNode()
        return this
    },
    
    subviewProto: function() {
        //console.log("looking for subviewProto")
        if (this.node()) {
            const vc = this.node().nodeRowViewClass()
            if (vc) { 
                return vc
            }
        }
        return DivStyledView.subviewProto.apply(this)
    },

    // --- syncing ---
    
    managedSubviews: function() {
        // use managedSubviews inside NodeView and subclasses so we can separate the
        // views with the NodeView syncs with the Node and it's subviews
        return this.subviews()
    },

    /*
    subviewForNode: function(aNode) {
        // TODO: optimize with a dictionary? 
        return this.managedSubviews().detect(aView => aView.node() === aNode )
    },
    */

    subviewForNode: function(aNode) {
        assert(this._subnodeToSubview)
        return this._subnodeToSubview[aNode]
    },

    updateSubnodeToSubviewMap: function() {
        // TODO: make this more efficient with add/remove hooks
        const dict = {}
        this.subviews().forEach((sv) => { dict[sv.node()] = sv })
        this._subnodeToSubview = dict
        return this
    },

    subviewProtoForSubnode: function(aSubnode) {
        let proto = this.overrideSubviewProto()
		
        if (!proto) {
		    proto = aSubnode.viewClass()
        }
				
        return proto      
    },

    
    newSubviewForSubnode: function(aSubnode) {
        if (!aSubnode) {
            throw new Error("null aSubnode")
        }
        
        const proto = this.subviewProtoForSubnode(aSubnode)
		
        if (!proto) {
            throw new Error("no subviewProto for subnode " + aSubnode.typeId())
        }
		
        return proto.clone().setNode(aSubnode) //.setParentView(this)
    },
    
    visibleSubnodes: function() {
        return this.node().subnodes()
    },
    
    syncFromNode: function () {
        // override this method if the view manages it's own subviews

        if (!this.node()) { 
            this.removeAllManagedSubviews();
            return
        }
        
        this.node().prepareToSyncToView()
        this.updateSubnodeToSubviewMap() // not ideal - move this to update on subview add/remove
       
        const newSubviews = []
        
        // only replace subviews if sync requires it,
        // and reuse subviews for subnodes which are still present 

        this.visibleSubnodes().forEach((subnode) => {
            let subview = this.subviewForNode(subnode) // get the current view for the node, if there is one
            
            if (!subview) {
                subview = this.newSubviewForSubnode(subnode)
            }
            
            if(subview == null) {
                throw new Error("null subview")
            }
            
            newSubviews.push(subview)   
        })
        
        if (!newSubviews.isEqual(this.managedSubviews())) {
            //this.removeAllSubviews() 
            this.removeAllManagedSubviews()
            this.addManagedSubviews(newSubviews)
            this.updateSubnodeToSubviewMap()
            // since node's don't hold a view reference, 
            // subviews no longer referenced in subviews list will be collected
        }

        this.managedSubviews().forEach(subview => subview.syncFromNode())

        return this
    },

    addManagedSubviews: function(newSubviews) {
        newSubviews.forEach(subview => this.addSubview(subview))
        return this
    },

    removeAllManagedSubviews: function() {
        this.managedSubviews().copy().forEach((aView) => { this.removeSubview(aView) })
        return this
    },
    
    syncToNode: function () {
        const node = this.node()
        if (node) {
            node.didUpdateNode()
            //node.scheduleSyncToStore()
        }
        return this
    },

    didUpdateNode: function () {
        //console.log(this.typeId() + " didUpdateNode " + this.node().type())
        this.scheduleSyncFromNode()
    },
    
    scheduleSyncToNode: function() {
        //NodeViewSynchronizer.addToNode(this)  
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "syncToNode")
        return this
    },
    
    scheduleSyncFromNode: function() {
        //NodeViewSynchronizer.addFromNode(this)    
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "syncFromNode")
        return this
    },

    // logging 
    
    logName: function() {
        return this.type()
    },
    
    log: function(msg) {
        const s = "[" + this.logName() + "] " + msg
        console.log(s)
        return this
    },
    
    onDropFiles: function(filePaths) {
        const node = this.node()
        if (node && node.onDropFiles) {
            node.onDropFiles(filePaths)
        }
        return this
    },
    
    // visibility
    
    onVisibility: function() {
	    DivStyledView.onVisibility.apply(this)
	    //console.log(this.typeId() + ".onVisibility()")
	    const node = this.node()
	    if (node && node.nodeBecameVisible) {
	        node.nodeBecameVisible()
	    }

	    return this
    },
    
    // value
    
    setValue: function(newValue) {
        this.setInnerHTML(newValue)			
        return this
    },
    
    value: function() {
        return this.innerHTML()
    },
})