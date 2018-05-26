"use strict"

window.BMNode = ideal.Proto.extend().newSlots({
    type: "BMNode",
        
    // row view summary
    title: null,
    subtitle: null,
    note: null,
    subtitleIsSubnodeCount: false,
    noteIsSubnodeCount: false,
        
    // row view interaction
    nodeThumbnailUrl: null,
    nodeTitleIsEditable: false,
    nodeSubtitleIsEditable: false,
    nodeRowIsSelectable: true,
    nodeVisibleClassName: null,
    
    nodeRowsStartAtBottom: false,

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
    	
    // view style overrides
    nodeColumnStyles: null,
    nodeRowStyles: null,

    nodeHasFooter: false,
    nodeInputFieldMethod: null,
    
    subnodeIndex: null,
    subnodeSortFunc: null,

    // debug
    debug: false,
}).setSlots({
    init: function () {
        this._subnodes = []
        this._actions = []        
        this._didUpdateNode = NotificationCenter.shared().newNotification().setSender(this._uniqueId).setName("didUpdateNode")
        this._shouldFocusSubnode = NotificationCenter.shared().newNotification().setSender(this._uniqueId).setName("shouldFocusSubnode")
        this._nodeMinWidth = 180
        this.scheduleFinalize()	
        
        this.setNodeColumnStyles(BMViewStyles.clone())
        this.setNodeRowStyles(BMViewStyles.clone())
        this.nodeRowStyles().selected().setColor("white")
        this.nodeRowStyles().unselected().setColor("#aaa")
        return this
    },

    // column view style
    
    setNodeColumnBackgroundColor: function(c) {
	    if (this.nodeColumnStyles()) {
            this.setNodeColumnStyles(BMViewStyles.clone())
	    }
	    
        this.nodeColumnStyles().selected().setBackgroundColor(c)
        this.nodeColumnStyles().unselected().setBackgroundColor(c)
        return this
    },

    nodeColumnBackgroundColor: function() {
	    if (this.nodeColumnStyles()) {
		    return this.nodeColumnStyles().selected().backgroundColor()
	    }
	    return null
    },
    
    // --- finalize ----------

    scheduleFinalize: function() {
        SyncScheduler.scheduleTargetAndMethod(this, "finalize")
    },
    
    unscheduleFinalize: function() {
        SyncScheduler.unscheduleTargetAndMethod(this, "finalize")
    },
    
    
    finalize: function() {
        // for subclasses to override
    },    
    
    // -----------------------
    
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
        // used by UI row views to browse into next column
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

	  	return Object.firstAncestorWithMatchingPostfixClass(this, "View")
    },

    // --- nodeRowViewClass ---
    
    /*
    rowNode: function() {
        return this
    },
    */

    nodeRowViewClass: function () {   
	  	return Object.firstAncestorWithMatchingPostfixClass(this, "RowView")
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
        
        if (this._subnodeIndex) {
            this.addSubnodeToIndex(aSubnode)
        }
        
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
        if(!this.containsSubnode(aSubnode)) {
            this.addSubnode(aSubnode)
            return true
        }
        return false
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
    	return this.subnodes().detect((subnode) => { return subnode.isEqual(aSubnode) })
	},
	*/
	
    isEqual: function(aNode) {
	    return this === aNode
    },
	
    containsSubnode: function(aSubnode) {
        if (this._subnodeIndex) {
            return aSubnode.hash() in this._subnodeIndex
        }
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
        //console.warn(this.typeId() + ".removeSubnode()")
        this.justRemoveSubnode(aSubnode)

        if (this._subnodeIndex) {
            delete this._subnodeIndex[aSubnode.hash()] 
        }
        
        this.didChangeSubnodeList()
        return aSubnode
    },
    
    removeAllSubnodes: function() {
	    if (this.subnodes().length) {
    		this.subnodes().slice().forEach((subnode) => {
    			this.justRemoveSubnode(subnode)
    		})
    		
            if (this._subnodeIndex) {
                this._subnodeIndex = {}
            }
        
            this.didChangeSubnodeList()
        }
        return this
    },

    didChangeSubnodeList: function() {
        this.sortIfNeeded() // TODO: move to a scheduleSort system - triggered before syncToStore and didUpdateNode?
        this.didUpdateNode()
        return this
    },
    
    // --- update / sync system ----------------------------
    
    scheduleSyncToView: function() {
        if (this.view()) {
            SyncScheduler.scheduleTargetAndMethod(this, "syncToView")
        }
        return this
    },

    didUpdateNode: function() {
        if (this._didUpdateNode) {
            this._didUpdateNode.post()
        }
        
        this.scheduleSyncToView()
    },
    
    syncToView: function() {
        //this._needsSyncToView = false
        if (this.view()) {
            this.view().didUpdateNode() // TODO: move to notifications?
        }  else {
            //console.log(this.typeId() + ".syncToView has no view")
        }
    },
    
    /*
    subnodes: function() {
        this.prepareToAccess()
        return this._subnodes
    },
    */
    
    // --- shelf ---
	
    shelfSubnodes: function() {
        return []
    },

    shelfIconName: function() {
	    return null
    },
	
    shelfIconUrl: function() {
	    return null
    },

    // ---------------------------------------
	
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
    
    postShouldFocusSubnode: function(aSubnode) {
        this._shouldFocusSubnode.setInfo(aSubnode).post()
        //this._shouldFocusSubnode.setInfo(aSubnode).schedulePost()
        return this
    },
    
    add: function () {  
        var newSubnode = this.subnodeProto().clone()
        //console.log(this.typeId() + " add " + newSubnode.type())
        this.addSubnode(newSubnode)
        this.didUpdateNode()
        this.postShouldFocusSubnode(newSubnode)
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
        if (this._subnodes && subnodes && this._subnodes.equalsArray(subnodes)) {
            //console.log(this.typeId() + ".setSubnodes() - skipping because subnodes are the same <<<<<<<<<<<<<<<<<<<<<")
            return this
        }
        subnodes.forEach((subnode) => { subnode.setParentNode(this) })
        this._subnodes = subnodes
        this.reindexSubnodesIfNeeded()
        this.didChangeSubnodeList()
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
	
    // subnode sorting
	
    setSubnodeSortFunc: function(f) {
	    if (this._subnodeSortFunc != f) {
	        this._subnodeSortFunc = f
	        this.sortIfNeeded()
	    }
	    return this
    },
	
    doesSortSubnodes: function() {
	    return this._subnodeSortFunc != null
    },
	
    sortIfNeeded: function() {
        if (this.doesSortSubnodes()) {
            this._subnodes = this._subnodes.sort(this._subnodeSortFunc)
        }
        return this
    },
    
    // subnodeIndex
	
    createSubnodeIndex: function() {
	    if (!this._subnodeIndex) { 
	        this._subnodeIndex = {}
	        this.reindexSubnodes()
	    }
	    return this
    },
	
    subnodeWithHash: function(h) {
        this.assertHasSubnodeIndex()
        return this._subnodeIndex[h]
    },
	
    removeSubnodeWithHash: function(h) {
	    var subnode = this.subnodeWithHash(h)
	    if (subnode) {
	        this.removeSubnode(subnode)
	    }
	    return this
    },
	
    hasSubnodeWithHash: function(h) {
        this.assertHasSubnodeIndex()
	    return h in this._subnodeIndex
    },
	
    addSubnodeToIndex: function(subnode) { // private
        this.assertHasSubnodeIndex()

	    if (!subnode.hash) {
            throw new Error(this.type() + " missing hash method on subnode of type " + subnode.typeId())
	    }
	    
        var h = subnode.hash()
        
        if (h == null) {
            throw new Error(this.type() + " null subnode hash")
        }
        
        var index = this._subnodeIndex
        
        if (h in index) {
            throw new Error(this.type() + " duplicate subnode hash " + h + " in indexed node")
        }
        
        index[h] = subnode
        return this	    
    },
	
    reindexSubnodesIfNeeded: function() {
        if (this._subnodeIndex) {
            this.reindexSubnodes()
        }
        return this
    },
	
    reindexSubnodes: function() { // private
	    //var shouldDeleteDuplicates = true // temporary
	    
        this.assertHasSubnodeIndex()
        this._subnodeIndex = {}
        
	    var index = this._subnodeIndex
	    this.subnodes().forEach((subnode) => {
	        /*
	        if (shouldDeleteDuplicates && this.hasSubnodeWithHash(subnode.hash())) {
	            console.warn("duplicate subnode hash found")
	        } else {
	            this.addSubnodeToIndex(subnode)
            }
	        */
            this.addSubnodeToIndex(subnode)
	    })
	    return this
    },

    assertHasSubnodeIndex: function(h) { // private
        if (!this._subnodeIndex) {
            throw new Error(this.type() + " missing subnode index")
        }
    },    	
    
    // node view badge

    nodeViewShouldBadge: function() {
        return false
    },

    nodeViewBadgeTitle: function() {
        return null
    },
	
    // visibility
	
    nodeBecameVisible: function() {
	    return this
    },
})
