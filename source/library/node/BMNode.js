"use strict"

/*

    BMNode

    The base class of model objects that supports the protocol 
    used to sync with views (subclasses of NodeView).

    The BMStorableNode subclass is used to sync the model to
    the persistence system (NodeStore).


        Notifications (intended for views):

            - didUpdateNode // lets views know they need to scheduleSyncFromNode
            - shouldFocusSubnode // request that the UI focus on the sender

        Update messages sent to self:
            - didChangeParentNode 
            - didChangeSubnodeList // hook to resort if needed and call didReorderParentSubnodes
            - prepareForFirstAccess // sent to self on first access to subnodes
            - prepareToAccess // sent to sent whenever a subnode is accessed

        Update messages sent to parent:
            - didUpdateNode // let parent know a subnode has changed

        Update messages sent to subnodes:
            - didReorderParentSubnodes // sent on subnode order change

        Protocol helpers:
            - watchOnceForNote(aNote) // typically used to watch for appDidInit

*/

ideal.Proto.newSubclassNamed("BMNode").newSlots({        
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
    nodeCanReorderSubnodes: false,

    // html
    acceptsFileDrop: false,

    nodeMinRowHeight: 0, // tall fields like draft body
    
    nodeContent: null,
    	
    // view style overrides
    viewDict: null, 

    nodeColumnStyles: null,
    nodeRowStyles: null,

    nodeHasFooter: false,
    nodeInputFieldMethod: null,
    
    subnodeIndex: null,
    subnodeSortFunc: null,

    // notification notes
    didUpdateNodeNote: null,
    shouldFocusSubnodeNote: null,

    
    nodeUsesColumnBackgroundColor: true,
    nodeInspector: null,
    canDelete: false,
    nodeCanInspect: false,
    nodeCanEditRowHeight: false,
    nodeCanEditColumnWidth: false,
}).setSlots({
    init: function () {
        this._subnodes = []
        this._actions = []        
        this.setDidUpdateNodeNote(NotificationCenter.shared().newNote().setSender(this).setName("didUpdateNode"))
        this.setShouldFocusSubnodeNote(NotificationCenter.shared().newNote().setSender(this).setName("shouldFocusSubnode"))
        this._nodeMinWidth = 180
        this.scheduleFinalize()	
        
        //this.setNodeColumnStyles(this.sharedNodeColumnStyles())
        //this.setNodeRowStyles(this.sharedNodeRowStyles())

        this.setNodeColumnStyles(BMViewStyles.clone())
        //this.setNodeRowStyles(BMViewStyles.clone())
        this.setViewDict({})
        return this
    },

    initNodeInspector: function() {

    },

    nodeInspector: function(aField) {
        if (!this._nodeInspector) {
            this._nodeInspector = BMNode.clone()
            this.initNodeInspector()
        }
        return this._nodeInspector
    },

    addInspectorField: function(aField) {
        this.inspector().addSubnode(aField)
        return this
    },

    customizeNodeRowStyles: function() {
        if (!this.hasOwnProperty("_nodeRowStyles")) {
            //const styles = BMViewStyles.sharedWhiteOnBlackStyle().setIsMutable(false)
            // NOTE: We can't use the shared style because column bg colors change

            const styles = BMViewStyles.clone()
            styles.selected().setColor("white")
            styles.unselected().setColor("#aaa")
            this._nodeRowStyles = styles
        }
        return this._nodeRowStyles
    },

    sharedNodeColumnStyles: function() {
        if (!BMNode.hasOwnProperty("_nodeColumnStyles")) {
            let styles = BMViewStyles.clone()
            //styles.selected().setColor("white")
            //styles.unselected().setColor("#aaa")
            BMNode._nodeColumnStyles = styles
        }
        return BMNode._nodeColumnStyles
    },

    sharedNodeRowStyles: function() {
        if (!BMNode._nodeRowStyles) {
            let styles = BMViewStyles.clone()
            BMNode._nodeRowStyles = styles
            styles.selected().setColor("white")
            styles.unselected().setColor("#aaa")
        }
        return BMNode._nodeRowStyles
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
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "finalize")
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
		
        return this.type().sansPrefix("BM")
    },

    // --- fields ---
    
    addLinkFieldForNode: function(aNode) {
        let field = BMLinkField.clone().setName(aNode.title()).setValue(aNode)
        return this.addStoredField(field)
    },
    
    addField: function(aField) {
        throw new Error("addField shouldn't be called - use BMFieldSetNode")
        return this.addSubnode(aField)
    },
        
    nodeRowLink: function() {
        // used by UI row views to browse into next column
        return this
    },    

    // nodeRowLinkMethods
    // used by UI row views to choose the node ref to use for the next column
    // if returns null, the row won't open another column
    // 
    // The two typical use cases are :
    //
    // 1) A pointer row which links to some other node.
    //
    // 2) A means to toggle between viewing the row's node or
    //    skipping to one of its subnodes. This allows a node
    //    to have inspector separated from "subnode" browsing.
    //    Example: a Server object might have the subnodes:
    //    [ StringFieldNode (for server name),  
    //      ActionNode (to connect/disconnect),
    //      ServerClientsNode (holds list of connected server clients)
    //

    thisNode: function() {
        return this
    },

    nodeRowLinkMethods: function() {
        return ["thisNode"]
    },

    defaultNodeRowLinkMethod: function() {

    },

    // subtitle and note
    
    subtitle: function () {
        if (this.subtitleIsSubnodeCount() && this.subnodesCount()) {
            return this.subnodesCount()
        }
        
        return this._subtitle
    },
    
    note: function () {
        if (this.noteIsSubnodeCount() && this.subnodesCount()) {
            return this.subnodesCount()
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
            return this.type() + "View" //.sansPrefix("BM")
        }
        
        return this._viewClassName
    },
    */
    
    viewClass: function () {        
        let name = this.viewClassName()
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
            //Error.showCurrentStack()
            return this
        }

        assert(aNode !== this)
		
        if (this._parentNode && aNode) {
            console.warn(this.type() + " setParentNode(" + aNode.type() + ")  already has parent " + this._parentNode.type())
        }
		
        this._parentNode = aNode
        this.didChangeParentNode()
        return this
    },

    didChangeParentNode: function() {
        // for subclasses to override
    },

    subnodeCount: function() {
        return this.subnodes().length
    },

    hasSubnodes: function() {
        return this.subnodeCount() > 0
    },

    justAddSubnode: function(aSubnode) {
        return this.justAddSubnodeAt(aSubnode, this.subnodeCount())
    },
	
    justAddSubnodeAt: function(aSubnode, anIndex) {
        if (this.subnodes() === null) {
            throw new Error("subnodes is null")
        }
        
        this.subnodes().atInsert(anIndex, aSubnode)

        if (this._subnodeIndex) {
            this.addSubnodeToIndex(aSubnode)
        }
        
        aSubnode.setParentNode(this)
        return aSubnode        
    },

    addSubnodeAt: function(aSubnode, anIndex) {
        this.justAddSubnodeAt(aSubnode, anIndex)
        this.didChangeSubnodeList()
        return aSubnode
    },

    replaceSubnodeWith: function(aSubnode, newSubnode) {
        const index = this.indexOfSubnode(aSubnode)
        assert(index !== -1)
        this.removeSubnode(aSubnode)
        this.addSubnodeAt(newSubnode, index)
        return newSubnode
    },

    addSubnode: function(aSubnode) {
        return this.addSubnodeAt(aSubnode, this.subnodeCount())
    },

    addSubnodes: function(subnodes) {
        subnodes.forEach(subnode => this.addSubnode(subnode))
        return this
    },

    addSubnodesIfAbsent: function(subnodes) {
        subnodes.forEach(subnode => this.addSubnodeIfAbsent(subnode))
        return this
    },
    
    addSubnodeIfAbsent: function(aSubnode) {
        if(!this.containsSubnode(aSubnode)) {
            this.addSubnode(aSubnode)
            return true
        }
        return false
    },

    acceptedSubnodeTypes: function() {
        const types = []
        if (this.subnodeProto()) {
            types.push(this.subnodeProto().type())
        }
        return types
    },

    acceptsAddingSubnode: function(aSubnode) {
        const ancestors = aSubnode.ancestorTypes()
        const match = this.acceptedSubnodeTypes().detect(type => 
            ancestors.contains(type)
        )
        return !Type.isNullOrUndefined(match)
    },

    addSubnodeProtoForSlotIfAbsent: function(aProto, slotName) {
        const getter = this[slotName]
        if (!getter) {
            throw new Error(this.type() + "." + slotName + " slot missing")
        }
		
        let slotValue = this[slotName].apply(this)
        assert(aProto)
		
        console.log(this.typeId() + ".addSubnodeProtoForSlotIfAbsent(" + aProto.type() + ", " + slotName + ")")
        console.log(this.typeId() + " slotValue = " + slotValue)
		
        if (slotValue === null) {
            slotValue = aProto.clone()
            //console.log(this.typeId() + "." + setterName + "(", obj, ")")
            const setterName = this.setterNameForSlot(slotName)
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
        
        if (aSubnode.parentNode() === this) {
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
        this.subnodes().forEach(subnode => subnode.didReorderParentSubnodes())
        this.didUpdateNode()
        return this
    },

    didReorderParentSubnodes: function() {
    },

    nodeReorderSudnodesTo: function(newSubnodes) {
        this.setSubnodes(newSubnodes)
        this.didChangeSubnodeList()
        return this
    },
    
    // --- update / sync system ----------------------------
    
    scheduleSyncToView: function() {
        this.didUpdateNode()
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this, "syncToView")
        return this
    },

    didUpdateNode: function() {
        this.didUpdateNodeNote().post()

        if (this.parentNode()) {
            assert(this.parentNode() !== this)
            this.parentNode().didUpdateNode()
        }

        //this.scheduleSyncToView()
    },
    
    privatePrepareToAccess: function() {
        if (!this._isPreparingToAccess) {
            this._isPreparingToAccess = true

            try {
                this.prepareToAccess()
            } catch(e) {
                this._isPreparingToAccess = false
                throw e
            }
            
            this._isPreparingToAccess = false
        }
        return this
    },

    subnodes: function() {
        this.privatePrepareToAccess() // causes access loop in some situations - use marker?
        return this._subnodes
    },

    indexOfSubnode: function(aSubnode) {
        return this.subnodes().indexOf(aSubnode);
    },

    subnodeIndex: function() {
        const p = this.parentNode()
        if (p) {
            return p.indexOfSubnode(this)
        }
        return 0
    },

    nodeDepth: function() {
        const p = this.parentNode()
        if (p) {
            return p.nodeDepth() + 1
        }
        return 0
    },

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
    
    prepareForFirstAccess: function() {
        // subclasses can override 
    },

    prepareToAccess: function() {
        // this should be called whenever subnodes need to be accessed
        if (!this._didPrepareForFirstAccess) {
            this._didPrepareForFirstAccess = true
            this.prepareForFirstAccess()
        }
    },
    
    prepareToSyncToView: function() {
        this.prepareToAccess();
    },
    
    tellParentNodes: function(msg, aNode) {
        let f = this[msg]
        if (f && f.apply(this, [aNode])) {
            return
        }

        let p = this.parentNode()
        if (p) {
            p.tellParentNodes(msg, aNode)
        }
    },
    
    // --- node path ------------------------
    
    nodePath: function () {
        if (this.parentNode()) {
            let parts = this.parentNode().nodePath()
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
            let subnode = this.firstSubnodeWithTitle(subpathArray[0])
            if (subnode) {
                return subnode.nodeAtSubpath(subpathArray.slice(1))
            }
            return null
        }        
        return this
    },

    // --- log ------------------------
    
    log: function(msg) {
        //let s = this.nodePathString() + " --  " + msg
        if (this.isDebugging()) {
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
        this.shouldFocusSubnodeNote().setInfo(aSubnode).post()
        return this
    },
    
    justAddAt: function (anIndex) {  
        const newSubnode = this.subnodeProto().clone()
        this.addSubnodeAt(newSubnode, anIndex)
        return newSubnode
    },

    justAdd: function (anIndex) {  
        return this.justAddAt(this.subnodeCount())
    },

    addAt: function(anIndex) {
        const newSubnode = this.justAddAt(anIndex)
        this.didUpdateNode()
        this.postShouldFocusSubnode(newSubnode)
        return newSubnode
    },

    add: function () {  
        return this.addAt(this.subnodeCount())
    },

    removeFromParentNode: function() {
        if (this.parentNode()) {
            this.parentNode().removeSubnode(this)
        }
        return this
    },
	
    delete: function () {
        this.removeFromParentNode()
        return this
    },

    /*
    nodeParentHasDeleteAction: function() {
        const p = this.parentNode()
        return p && p.hasAction("delete")
    },
    */

    /*
    canDelete: function() {
        if (this._canDelete) {
            return true
        }

        return this.nodeParentHasDeleteAction()
    },
    */

    canSelfAddSubnode: function() {
        return this.hasAction("add")
    },

    // --- utility -----------------------------
    
    parentNodeOfType: function(className) {
        if (this.type() === className) {
            return this
        }
        
        if (this.parentNode()) {
            return this.parentNode().parentNodeOfType(className)
        }
        
        return null
    },

    parentNodes: function() {
        const node = this.parentNode()
        const results = []
		
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
	    const results = this.subnodes().select((subnode) => { return subnode !== aSubnode })
	    return results
    },
	
    firstSubnodeOfType: function(aProto) {
        this.prepareToAccess(); // put guard on subnodes instead?

        return this.subnodes().detect(function (subnode) {
            return subnode.type() === aProto.type()
        })
    },

    firstSubnodeWithSubtitle: function(aString) {
        this.prepareToAccess(); // put guard on subnodes instead?

        return this.subnodes().detect(function (subnode) {
            return subnode.subtitle() === aString
        })
    },
        
    firstSubnodeWithTitle: function(aString) {
        this.prepareToAccess(); // put guard on subnodes instead?

        return this.subnodes().detect(function (subnode) {
            return subnode.title() === aString
        })
    },

    sendRespondingSubnodes: function(aMethodName) {
        this.subnodes().forEach((subnode) => { 
            if (subnode[aMethodName]) {
                subnode[aMethodName].apply(subnode)
            }
        })
        return this
    },
    
    // --- subnodes -----------------------------
    
    subnodesCount: function() {
        this.prepareToAccess()
        return this._subnodes.length
    },
    
    setSubnodes: function(subnodes) {
        if (this._subnodes && subnodes && this._subnodes.equals(subnodes)) {
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
        const missing = this.subnodes().detect(function (subnode) { return !subnode.parentNode() })
        if (missing) {
            throw new Error("missing parent node on subnode " + missing.type())
        }
        return this
    },
	
    // subnode sorting
	
    setSubnodeSortFunc: function(f) {
	    if (this._subnodeSortFunc !== f) {
	        this._subnodeSortFunc = f
	        this.sortIfNeeded()
	    }
	    return this
    },
	
    doesSortSubnodes: function() {
	    return this._subnodeSortFunc !== null
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
	    let subnode = this.subnodeWithHash(h)
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
	    
        let h = subnode.hash()
        
        if (h === null) {
            throw new Error(this.type() + " null subnode hash")
        }
        
        let index = this._subnodeIndex
        
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
	    //let shouldDeleteDuplicates = true // temporary
	    
        this.assertHasSubnodeIndex()
        this._subnodeIndex = {}
        
	    let index = this._subnodeIndex
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

    // --- json serialization ---

    asJSON: function() {
        const dict = {}
        dict.type = this.type()
        dict.title = this.title()
        // TODO: store persistent slots...
        // TODO: store subnodes if set to store them
        if (this.subnodes().length) { // TODO: use a count method?
            dict.subnodes = this.subnodes().map((subnode) => {
                return subnode.asJSON()
            })
        }
        return dict
    },

    isLoadingFromJSON: function() {
        return this._isLoadingFromJSON
    },
    
    fromJSON: function(json) {
        this._isLoadingFromJSON = true
        // TODO: read persistent keys
        if (json.title) {
            this.setTitle(json.title)
        }
        
        if (json.subnodes) { 
            this.setSubnodes(json.subnodes.map((subnodeDict) => {
                const type = subnodeDict.type
                return window[type].clone().fromJSON(subnodeDict)
            }))
        }
        delete this._isLoadingFromJSON
        return this
    },

    asyncFromJSONFile: function(file) {
        const rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status === 0)
                {
                    let json = rawFile.responseText;
                    this.fromJSON(JSON.parse(json))
                }
            }
        }
        rawFile.send(null);
    },

    // notification helpers - yeah, not ideal

    watchOnceForNote: function(aNoteName) {
        const obs = NotificationCenter.shared().newObservation()
        obs.setName(aNoteName)
        obs.setObserver(this)
        obs.setIsOneShot(true)
        obs.watch()
        //console.log(this.typeId() + ".watchOnceForNote('" + aNoteName + "')")
        return obs
    },

    postNoteNamed: function(aNoteName) {
        const note = window.NotificationCenter.shared().newNote()
        note.setSender(this)
        note.setName(aNoteName)
        note.post()
        //console.log(this.typeId() + ".postNoteNamed('" + aNoteName + "')")
        return note
    },

    scheduleSelfFor: function(aMethodName, milliseconds) {
        return window.SyncScheduler.shared().scheduleTargetAndMethod(this, aMethodName, milliseconds)
    },

})
