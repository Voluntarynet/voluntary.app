
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

    nodeHasFooter: false,
    nodeInputFieldMethod: null,
    
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

	nodeHeaderTitle: function() {
		return this.title()
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
    
	setParentNode: function(aNode) {
		if (aNode === this._parentNode) {
			//console.warn(this.type() + " setParentNode(" + aNode.type() + ")  already has parent ", this._parentNode.type())
			//ShowStack()
			return this
		}
		
		if (this._parentNode && aNode) {
			console.warn(this.type() + " setParentNode(" + aNode.type() + ")  already has parent " + this._parentNode.type())
		}
		
		this._parentNode = aNode
		return this
	},
	
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
		
		console.log(this.type() + ".addSubnodeProtoForSlotIfAbsent(" + aProto.type() + ", " + slotName + ")")
		console.log(this.type() + " slotValue = " + slotValue)
		
		if (slotValue == null) {
		    
			slotValue = aProto.clone()
			//console.log(this.type() + "." + setterName + "(", obj, ")")
			var setterName = this.setterNameForSlot(slotName)
			this[setterName].apply(this, [slotValue])
		}
		// TODO: this doesn't preserve ordering - how to address this?
		// split up init between stored and unstored slots?
		
		if (!this.containsSubnode(slotValue)) {
			this.addSubnode(slotValue)
        }
        
		return this
	},
	
	/*
	hasSubnode: function(aSubnode) {
	    return this.subnodes().contains(aSubnode)
	},
	*/
	
	isEqual: function(aNode) {
	    return this === aNode
	},
	
    containsSubnode: function(aSubnode) {
        return this.subnodes().detect((subnode) => { return subnode.isEqual(aSubnode) })
    },
    
    justRemoveSubnode: function(aSubnode) { // private method 
        this.subnodes().remove(aSubnode)
        
        if (aSubnode.parentNode() == this) {
            aSubnode.setParentNode(null)
        }
        
        return aSubnode
    },
    
    removeSubnode: function(aSubnode) {
        this.justRemoveSubnode(aSubnode)
        this.didChangeSubnodeList()
        return aSubnode
    },
    
	removeAllSubnodes: function() {
	    if (this.subnodes().length) {
    		this.subnodes().slice().forEach((subnode) => {
    			this.justRemoveSubnode(subnode)
    		})
            this.didChangeSubnodeList()
        }
		return this
	},

    didChangeSubnodeList: function() {
        this.markDirty()
        this.didUpdateNode()
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

    didUpdateNode: function() {
        if (this._didUpdateNodeNote) {
            this._didUpdateNodeNote.post()
        }
        
        this.setNeedsSyncToView(true)

/*
		// this is too slow for general use e.g. text editing if parent nodes have lots of items
        if (this.parentNode()) {
            this.parentNode().didUpdateNode()
        }
*/
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
    
    tellParentNodes: function(msg, aNode) {
        var f = this[msg]
        if (f && f.apply(this, [aNode])) {
            return
        }

        var p = this.parentNode()
        if (p) {
            p.tellParentNodes(msg, aNode)
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
			this.didUpdateNode()
		}
        return this
    },

	removeAction: function(actionString) {
		if (this.actions().contains(actionString)) {
        	this.actions().remove(actionString)
			this.didUpdateNode()
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
        //console.log(this.typeId() + " add " + newSubnode.type())
        this.addSubnode(newSubnode)
        this.didUpdateNode()
        this._shouldFocusSubnodeNote.setInfo(newSubnode).post()
        return newSubnode
    },

	removeFromParentNode: function() {
        this.parentNode().removeSubnode(this)
		return this
	},
	
    delete: function () {
        this.removeFromParentNode()
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

	parentNodes: function() {
		var node = this.parentNode()
		var results = []
		
		while (node) {
			results.push(node)
			node = this.parentNode()
		}
		return results
	},
	
	parentNodeTypes: function() {
		return this.parentNodes().map((node) => { return node.type() })
	},
    
    // --- subnode lookup -----------------------------
    
	subnodesSans: function(aSubnode) {
	    var results = this.subnodes().select((subnode) => { return subnode != aSubnode })
	    return results
	},
	
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
		if (this._subnodes && subnodes && this._subnodes.equals(subnodes)) {
			//console.log(this.typeId() + ".setSubnodes() - skipping because subnodes are the same <<<<<<<<<<<<<<<<<<<<<")
			return this
		}
		subnodes.forEach((subnode) => { subnode.setParentNode(this) })
        this._subnodes = subnodes
		this.markDirty()
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

	
	markDirty: function() {
		// to be used by subclasses
		// useful for persistence
	},
    
})
