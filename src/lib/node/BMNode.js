
BMNode = ideal.Proto.extend().newSlots({
    type: "BMNode",
        
	// row view summary
    title: null,
    subtitle: null,
    note: null,
    subtitleIsSubnodeCount: false,
    noteIsSubnodeCount: false,
        
    // row view interaction
    nodeTitleIsEditable: false,
    nodeSubtitleIsEditable: false,
	nodeRowIsSelectable: true,
	nodeVisibleClassName: null,
	
	// column settings (this should really auto adjust to fit)
    nodeMinWidth: 200,

    // view
    view: null,
    viewClassName: null,

    // parent node, subnodes
    parentNode: null,
    subnodes: null,
    subnodeProto: null,
    nodeEmptyLabel: null, // shown in view when there are no subnodes

	// actions
    actions: null,

    // sync
    needsSyncToView: false, 

	// html
    acceptsFileDrop: false,

    nodeMinHeight: 0, // tall fields like draft body

    nodeContent: null,
    nodeBackgroundColor: null,
        
	// persistence 
    pid: null,
	shouldStore: false,
	
	// debug
    debug: false,
}).setSlots({
    init: function () {
        this._subnodes = []
        this._actions = []        
        this._didUpdateNodeNote = NotificationCenter.shared().newNotification().setSender(this._uniqueId).setName("didUpdateNode")
        this._shouldFocusSubnodeNote = NotificationCenter.shared().newNotification().setSender(this._uniqueId).setName("shouldFocusSubnode")
        this._nodeMinWidth = 180
        return this
    },

	nodeVisibleClassName: function() {
		if (this._nodeVisibleClassName) {
			return this._nodeVisibleClassName
		}
		
		return this.type().prefixRemoved("BM")
	},

	// --- fields ---
    
    addLinkFieldForNode: function(aNode) {
        var field = BMLinkField.clone().setName(aNode.title()).setValue(aNode)
        return this.addStoredField(field)
    },
    
    addField: function(aField) {
		throw "shouldn't be called"
        return this.addSubnode(aField)
    },
        
    nodeRowLink: function() {
        return this
    },    

	// subtitle and note
    
    subtitle: function () {
        if (this.subtitleIsSubnodeCount() && this.subnodesLength()) {
            return this.subnodesLength()
        }
        
        return this._subtitle
    },
    
    note: function () {
        if (this.noteIsSubnodeCount() && this.subnodesLength()) {
            return this.subnodesLength()
        }
        
        return this._note
    },

	// --- viewClassName ---
    
/*
    viewClassName: function() {
        if (!this._viewClassName) {
            return this.type() + "View" //.prefixRemoved("BM")
        }
        
        return this._viewClassName
    },
*/
    
    viewClass: function () {        
        var name = this.viewClassName()
        if (name) {
            return window[name]
        }

	  	return this.firstAncestorWithMatchingPostfixClass("View")        
    },

	// --- nodeRowViewClass ---
    
    /*
    rowNode: function() {
        return this
    },
    */

    nodeRowViewClass: function () {   
	  	return this.firstAncestorWithMatchingPostfixClass("RowView")
    },

	// --- subnodes ----------------------------------------
    
    justAddSubnode: function(aSubnode) {
        if (this.subnodes() == null) {
            throw new Error("subnodes is null")
        }
        this.subnodes().push(aSubnode)
        aSubnode.setParentNode(this)
        return aSubnode        
    },

    addSubnode: function(aSubnode) {
        this.justAddSubnode(aSubnode)
        this.didChangeSubnodeList()
        return aSubnode
    },

	addSubnodesIfAbsent: function(subnodes) {
		subnodes.forEach((subnode) => { this.addSubnodeIfAbsent(subnode) })
		return this
	},
    
    addSubnodeIfAbsent: function(aSubnode) {
        if(!this.subnodes().contains(aSubnode)) {
            this.addSubnode(aSubnode)
        }
        return aSubnode
    },

	addSubnodeProtoForSlotIfAbsent: function(aProto, slotName) {
		var getter = this[slotName]
		if (!getter) {
			throw new Error(this.type() + "." + slotName + " slot missing")
		}
		
		var slotValue = this[slotName].apply(this)
		assert(aProto)
				
		if (slotValue === null) {
			var obj = aProto.clone()
			var setterName = this.setterNameForSlot(slotName)
			this[setterName].apply(this, [obj])
			this.addSubnode(obj)
		}
		
		return this
	},
    
    removeSubnode: function(aSubnode) {
        this.subnodes().remove(aSubnode)
        
        if (aSubnode.parentNode() == this) {
            aSubnode.setParentNode(null)
        }
        
        this.didChangeSubnodeList()
        return aSubnode
    },

    didChangeSubnodeList: function() {
        this.markDirty()
        this.didUpdate()
        return this
    },
    
    // --- update / sync system ----------------------------
    
    setNeedsSyncToView: function(aBool) {
        if (this._needsSyncToView == aBool) { 
            return this; 
        }
        
        //this.log("needsSyncToView " + this._needsSyncToView + " -> " + aBool)

        if (aBool && !this._needsSyncToView) {
            //this.log(" >>> adding timer syncToView")
            
            setTimeout( () => { 
                this.syncToView()
                //this.log(" +++ fired syncToView")
            }, 1)            
        }
        
        this._needsSyncToView = aBool
        return this
    },

    didUpdate: function() {
        if (this._didUpdateNodeNote) {
            this._didUpdateNodeNote.post()
        }
        
        this.setNeedsSyncToView(true)

        if (this.parentNode()) {
            this.parentNode().didUpdate()
        }
    },
    
    syncToViewIfNeeded: function() {
        if (this.needsSyncToView()) {
            this.syncToView()
        }
    },
    
    syncToView: function() {
        this._needsSyncToView = false
        if (this.view()) {
            this.view().didUpdateNode() // TODO: move to notifications?
        }        
    },
    
    prepareToAccess: function() {
        
    },
    
    prepareToSyncToView: function() {
        this.prepareToAccess();
    },
    
    tellParents: function(msg, aNode) {
        var f = this[msg]
        if (f && f.apply(this, [aNode])) {
            return
        }

        var p = this.parentNode()
        if (p) {
            p.tellParents(msg, aNode)
        }
    },
    
    // --- node path ------------------------
    
    nodePath: function () {
        if (this.parentNode()) {
            var parts = this.parentNode().nodePath()
            parts.push(this)
            return parts
        }
        return [this]
    },
    
    nodePathString: function () {
        return this.nodePath().map(function (node) { return node.title() }).join("/")
        //return this.nodePath().map(function (node) { return node.type() }).join("/")
    },
    
    nodeAtSubpathString: function(pathString) {
        return this.nodeAtSubpath(pathString.split("/"));        
    },
    
    nodeAtSubpath: function(subpathArray) {
        if (subpathArray.length > 0) {
            var subnode = this.firstSubnodeWithTitle(subpathArray[0])
            if (subnode) {
                return subnode.nodeAtSubpath(subpathArray.slice(1))
            }
            return null
        }        
        return this
    },

    // --- log ------------------------
    
    log: function(msg) {
        //var s = this.nodePathString() + " --  " + msg
		if (this.debug()) {
        	console.log("[" +  this.nodePathString() + "] " + msg)
		}
    },
    
    // --- standard actions -----------------------------
    
    addAction: function(actionString) {
		if (!this.actions().contains(actionString)) {
	        this.actions().push(actionString)
			this.didUpdate()
		}
        return this
    },

	removeAction: function(actionString) {
		if (this.actions().contains(actionString)) {
        	this.actions().remove(actionString)
			this.didUpdate()
		}
		return this
	},
    
    addActions: function(actionStringList) {
        actionStringList.forEach( (action) => {
            this.addAction(action)
        })
        return this
    },
    
    hasAction: function(actionName) {
        return this.actions().contains(actionName)
    },
    
    performAction: function(actionName) {
        return this[actionName].apply(this)
    },
    
    add: function () {  
        var newSubnode = this.subnodeProto().clone()
        console.log("BMNode add " + newSubnode.type())
        this.addSubnode(newSubnode)
        this.didUpdate()
        this._shouldFocusSubnodeNote.setInfo(newSubnode).post()
        return newSubnode
    },

    delete: function () {
        this.parentNode().removeSubnode(this)
        return this
    },

	// --- utility -----------------------------
    
    parentNodeOfType: function(className) {
        if (this.type() == className) {
            return this
        }
        
        if (this.parentNode()) {
            return this.parentNode().parentNodeOfType(className)
        }
        
        return null
    },
    
    // --- subnode lookup -----------------------------
    
    firstSubnodeOfType: function(aProto) {
        this.prepareToAccess(); // put guard on subnodes instead?

        return this.subnodes().detect(function (subnode) {
            return subnode.type() == aProto.type()
        })
    },

    firstSubnodeWithSubtitle: function(aString) {
        this.prepareToAccess(); // put guard on subnodes instead?

        return this.subnodes().detect(function (subnode) {
            return subnode.subtitle() == aString
        })
    },
        
    firstSubnodeWithTitle: function(aString) {
        this.prepareToAccess(); // put guard on subnodes instead?

        return this.subnodes().detect(function (subnode) {
            return subnode.title() == aString
        })
    },
    
    // --- subnodes -----------------------------
    
    subnodesLength: function() {
        return this._subnodes.length
    },
    
    setSubnodes: function(subnodes) {
        this._subnodes = subnodes
        //this.verifySubnodesHaveParentNodes()
        return this
    },

    
    verifySubnodesHaveParentNodes: function() {
        var missing = this.subnodes().detect(function (subnode) { return !subnode.parentNode() })
        if (missing) {
            throw new Error("missing parent node on subnode " + missing.type())
        }
        return this
    },
    
    // -----------------------------------------------
    // persistence
    // -----------------------------------------------

    setPidSymbol: function(aPid) {
        this.setPid(aPid)
        this.loadIfPresent()
        return this
    },
        
    setPid: function(aPid) {
        this._pid = aPid
        
        NodeStore.shared().addActiveObject(this)
        this.markDirty()
        return this
    },
    
    assignPid: function() {
        if (this._pid) {
            throw new Error("attempt to reassign pid")
        }
        
        this._pid = NodeStore.shared().pidOfObj(this)
        
        NodeStore.shared().addActiveObject(this)
        this.markDirty()
        
        return this
    },
    
    pid: function() {
		if (!this.shouldStore()) {
			
			throw new Error("attempt to prepare to store a node of type '" + this.type() + "' which has shouldStore == false, use this.setShouldStore(true)")
		}
		
        if (!this._pid) {
            this.assignPid()
        }
        return this._pid
    },
    
    markDirty: function() {
        //console.trace("markDirty(" + this.title() + " " + this.pid() + ")")
        //console.log("markDirty(" +this.title() + ")")
		if (this.shouldStore() && !this.isUnserializing()) {
        	NodeStore.shared().addDirtyObject(this)
		}
        return this
    },
    
    // nodeDict
    
    nodeDict: function() {
        return { 
            type: this.type(),
            children: this.subnodePids()
        }    
    },
    
    setNodeDict: function(aDict) {
        // ignore - BMStorableNode will override 
		//this.didLoadFromStore() // BMStorableNode.setNodeDict wants to do this *after* it's done
        return this
    },
 
	didLoadFromStore: function() {
		//console.log(this.type() + " didLoadFromStore")
	},
 
    // store
    
    store: function() {
        NodeStore.shared().storeObject(obj)
        return this
    },
    
    existsInStore: function() {
        return localStorage.getItem(obj.pid()) != null
    },
    
    loadIfPresent: function() {
        if (this.existsInStore()) {
            NodeStore.shared().loadObject(this)
        }
        return this
    },
    
    storeIfAbsent: function() {
        if (!this.existsInStore()) {
            this.store()
        }
        return this
    },

	// StorableNode
	
    subnodePids: function() {
        var pids = []
        
        this.subnodes().forEach((subnode) => {
            if (subnode.shouldStore() == true) {
                pids.push(subnode.pid())
            }
        })

        return pids
    },
    
    setSubnodePids: function(pids) {
        var subnodes = pids.map((pid) => {
            return NodeStore.shared().objectForPid(pid).setParentNode(this)
        })

        this.setSubnodes(subnodes)
        return this
    },
})
