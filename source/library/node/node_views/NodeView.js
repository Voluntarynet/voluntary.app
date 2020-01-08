"use strict"

/*

    NodeView

*/

window.NodeView = class NodeView extends DomStyledView {
    
    initPrototype () {
        this.newSlot("node", null) //.setDuplicateOp("duplicate")
        //this.newSlot("ownsView", true)
        this.newSlot("overrideSubviewProto", null)
        this.newSlot("nodeObservation", null)
        this.newSlot("isInspecting", false)
    }

    init () {
        super.init()
        //this.superProxy().init()
        //this.setNodeObservation(NotificationCenter.shared().newObservation().setName("didUpdateNode").setObserver(this))
        this.setNodeObservation(NotificationCenter.shared().newObservation().setObserver(this)) // observe all
        //this.setStyles(BMViewStyles.clone())
        this.updateSubnodeToSubviewMap()
        return this
    } //.setDocs("init", "initializes the object", "returns this"),
	
	
    setNode (aNode) {

        if (this._node !== aNode) {

            this.stopWatchingNode()
            this._node = aNode
            this.startWatchingNode()

            this.updateElementIdLabel()
            this.didChangeNode()
        }
		
        return this
    }

    updateElementIdLabel () {
        const nodeId = this.node() ? this.node().typeId() : "null"
        this.element().id = this.typeId() + " for node " + nodeId
    }
    
    didChangeNode () {
        if (this.node()) {
            this.scheduleSyncFromNode()
        }
        return this
    }
 
    startWatchingNode () {
        if (this.node()) {
            //console.log("startWatchingNode " + this.node() + " observation count = " + NotificationCenter.shared().observations().length)
            this.nodeObservation().setTarget(this.node()).watch()
            //this.node().onStartObserving()
        }
        return this
    }
       
    stopWatchingNode () {
        if (this.node()) {
            //console.log("stopWatchingNode " + this.node() + " observation count = " + NotificationCenter.shared().observations().length)
            this.nodeObservation().stopWatching()
            //this.node().onStopObserving()
        }
        return this
    }
    
    willRemove () {
        super.willRemove()
        this.stopWatchingNode()
        return this
    }
    
    subviewProto () {
        //console.log("looking for subviewProto")
        if (this.node()) {
            const vc = this.node().nodeRowViewClass()
            if (vc) { 
                return vc
            }
        }
        return super.subviewProto()
    }

    // --- syncing ---
    
    managedSubviews () {
        // use managedSubviews inside NodeView and subclasses so we can separate the
        // views with the NodeView syncs with the Node and it's subviews
        return this.subviews()
    }

    /*
    subviewForNode (aNode) {
        // TODO: optimize with a dictionary? 
        return this.managedSubviews().detect(aView => aView.node() === aNode )
    }
    */

    subviewForNode (aNode) {
        assert(this._subnodeToSubview)
        return this._subnodeToSubview[aNode]
    }

    updateSubnodeToSubviewMap () {
        // TODO: make this more efficient with add/remove hooks
        const dict = {}
        this.subviews().forEach( sv => dict.atPut(sv.node(), sv) )
        this._subnodeToSubview = dict
        return this
    }

    subviewProtoForSubnode (aSubnode) {
        let proto = this.overrideSubviewProto()
		
        if (!proto) {
		    proto = aSubnode.viewClass()
        }
				
        return proto      
    }

    
    newSubviewForSubnode (aSubnode) {
        if (!aSubnode) {
            throw new Error("null aSubnode")
        }
        
        const proto = this.subviewProtoForSubnode(aSubnode)
		
        if (!proto) {
            throw new Error("no subviewProto for subnode " + aSubnode.typeId())
        }
		
        return proto.clone().setNode(aSubnode) //.setParentView(this)
    }

    updateSubviews () {
        // for subclasses to override
        return this
    }
    
    visibleSubnodes () {
        return this.node().subnodes()
    }
    
    syncFromNode () {
        // override this method if the view manages it's own subviews

        if (!this.node()) { 
            this.removeAllSubviews();
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
            
            if(Type.isNull(subview)) {
                throw new Error("null subview")
            }
            
            newSubviews.push(subview)   
        })
        
        if (!newSubviews.isEqual(this.managedSubviews())) {
            //this.removeAllSubviews() 
            this.removeAllSubviews()
            this.addSubviews(newSubviews)
            this.updateSubnodeToSubviewMap()
            // since node's don't hold a view reference, 
            // subviews no longer referenced in subviews list will be collected
        }

        this.managedSubviews().forEach(subview => subview.syncFromNode())

        return this
    }
    
    syncToNode () {
        const node = this.node()
        if (node) {
            node.didUpdateNode()
            //node.scheduleSyncToStore()
        }
        return this
    }

    didUpdateNode () {
        //this.debugLog(" didUpdateNode " + this.node().type())
        this.scheduleSyncFromNode()
    }
    
    scheduleSyncToNode () {
        if (this.hasScheduleSyncFromNode()) {
            this.hasScheduleSyncFromNode()
            console.log("SKIPPING scheduleSyncToNode because hasScheduleSyncFromNode")
            window.SyncScheduler.shared().unscheduleTargetAndMethod(this, "syncFromNode")
            return this
        }
        /*
        if (this.hasScheduleSyncFromNode()) {
            // wait for view to sync with node first
            this.unscheduleTargetAndMethod(this, "syncFromNode")
            return this
        }
        */
        
        //NodeViewSynchronizer.addToNode(this)  
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "syncToNode", 0)
        return this
    }
    
    hasScheduleSyncToNode () {
        return window.SyncScheduler.shared().isSyncingOrScheduledTargetAndMethod(this, "syncToNode")
    }

    scheduleSyncFromNode () {
        assert(!this.hasScheduleSyncToNode())
        /*
        if (this.hasScheduleSyncToNode()) {
            // wait for view to sync with node first
            assert(!this.hasScheduleSyncToNode())
            return this
        }
        */

        //NodeViewSynchronizer.addFromNode(this)    
        //this.debugLog(" scheduleSyncFromNode")
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "syncFromNode")
        return this
    }

    hasScheduleSyncFromNode () {
        return window.SyncScheduler.shared().isSyncingOrScheduledTargetAndMethod(this, "syncFromNode")
    }

    // logging 
    
    logName () {
        return this.type()
    }
    
    log (msg) {
        const s = "[" + this.logName() + "] " + msg
        console.log(s)
        return this
    }
    
    onDropFiles (filePaths) {
        const node = this.node()
        if (node && node.onDropFiles) {
            node.onDropFiles(filePaths)
        }
        return this
    }
    
    // visibility
    
    onVisibility () {
	    super.onVisibility()
	    //this.debugLog(".onVisibility()")
	    const node = this.node()
	    if (node && node.nodeBecameVisible) {
	        node.nodeBecameVisible()
	    }

	    return this
    }
    
    // value
    
    setValue (newValue) {
        this.setInnerHTML(newValue)			
        return this
    }
    
    value () {
        return this.innerHTML()
    }
    
}.initThisClass()
