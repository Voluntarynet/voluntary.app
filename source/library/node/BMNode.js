"use strict"

/*

    BMNode
 
    The base class of model objects that supports the protocol 
    used to sync with views (subclasses of NodeView).

    The BMStorableNode subclass is used to sync the model to
    the persistence system.


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

window.BMNode = class BMNode extends ProtoClass {
    
    initPrototype () {
        
        // row view summary

        this.newSlot("title", null).setDuplicateOp("copyValue")
        this.newSlot("subtitle", null).setDuplicateOp("copyValue")
        this.newSlot("note", null).setDuplicateOp("copyValue")

        // parent node, subnodes

        this.newSlot("parentNode", null)
        this.newSlot("nodeCanReorderSubnodes", false)
        this.newSlot("subnodes", null).setInitProto(SubnodesArray)
        this.newSlot("shouldStoreSubnodes", true) //.setShouldStore(true)
        this.newSlot("subnodeProto", null)

        // notification notes

        this.newSlot("didUpdateNodeNote", null) // private
        this.newSlot("shouldFocusSubnodeNote", null) // private

        // view related, but computed on node

        this.newSlot("subtitleIsSubnodeCount", false).setDuplicateOp("copyValue")
        this.newSlot("nodeVisibleClassName", null).setDuplicateOp("copyValue")
        this.newSlot("noteIsSubnodeCount", false).setDuplicateOp("copyValue")
        this.newSlot("nodeEmptyLabel", null) // shown in view when there are no subnodes

        // view settings

        this.newSlot("viewClassName", null)
        this.newSlot("nodeThumbnailUrl", null)
        this.newSlot("nodeCanEditTitle", false).setDuplicateOp("copyValue")
        this.newSlot("nodeCanEditSubtitle", false).setDuplicateOp("copyValue")
        this.newSlot("nodeRowIsSelectable", true).setDuplicateOp("copyValue")
        this.newSlot("nodeRowsStartAtBottom", false).setDuplicateOp("copyValue")
        this.newSlot("nodeMinRowHeight", 0).setDuplicateOp("copyValue")

        // html

        this.newSlot("acceptsFileDrop", false)

        // view style overrides

        this.newSlot("viewDict", null)
        this.newSlot("nodeColumnStyles", null)
        this.newSlot("nodeRowStyles", null)

        // view footer

        this.newSlot("nodeHasFooter", false)
        this.newSlot("nodeInputFieldMethod", null)

        // column settings - TODO: auto adjust to fit?

        this.newSlot("nodeMinWidth", 200).setDuplicateOp("copyValue")
        this.newSlot("nodeUsesColumnBackgroundColor", true).setDuplicateOp("copyValue")
        this.newSlot("canDelete", false).setDuplicateOp("copyValue")
        this.newSlot("nodeCanEditRowHeight", false).setDuplicateOp("copyValue")
        this.newSlot("nodeCanEditColumnWidth", false).setDuplicateOp("copyValue")

        // inspector

        this.newSlot("nodeCanInspect", false).setDuplicateOp("copyValue")
        this.newSlot("nodeInspector", null)

        // actions

        this.newSlot("actions", null).setInitProto(Array)
    }

    init () {
        super.init()

        this.setDidUpdateNodeNote(NotificationCenter.shared().newNote().setSender(this).setName("didUpdateNode"))
        this.setShouldFocusSubnodeNote(NotificationCenter.shared().newNote().setSender(this).setName("shouldFocusSubnode"))
        this._nodeMinWidth = 180
        
        //this.setNodeColumnStyles(this.sharedNodeColumnStyles())
        //this.setNodeRowStyles(this.sharedNodeRowStyles())

        this.setNodeColumnStyles(BMViewStyles.clone())
        //this.setNodeRowStyles(BMViewStyles.clone())
        this.setViewDict({})
        return this
    }

    duplicate () {
        const dup = super.duplicate()
        dup.setSubnodes(this.subnodes().map(sn => sn.duplicate()))
        return dup
    }

    pid () {
        return this.puuid()
    }

    nodeInspector (aField) {
        if (!this._nodeInspector) {
            this._nodeInspector = BMNode.clone().setNodeMinWidth(500)
            this.initNodeInspector()
        }
        return this._nodeInspector
    }

    initNodeInspector () {
        //this.addInspectorField(aField) // example
        return this
    }

    addInspectorField (aField) {
        this.nodeInspector().addSubnode(aField)
        return this
    }

    customizeNodeRowStyles () {
        if (!this.hasOwnProperty("_nodeRowStyles")) {
            //const styles = BMViewStyles.shared().sharedWhiteOnBlackStyle().setIsMutable(false)
            // NOTE: We can't use the shared style because column bg colors change

            const styles = BMViewStyles.clone()
            styles.selected().setColor("white")
            styles.unselected().setColor("#aaa")
            this._nodeRowStyles = styles
        }
        return this._nodeRowStyles
    }

    sharedNodeColumnStyles () {
        if (!BMNode.hasOwnProperty("_nodeColumnStyles")) {
            const styles = BMViewStyles.clone()
            //styles.selected().setColor("white")
            //styles.unselected().setColor("#aaa")
            BMNode._nodeColumnStyles = styles
        }
        return BMNode._nodeColumnStyles
    }

    sharedNodeRowStyles () {
        if (!BMNode._nodeRowStyles) {
            const styles = BMViewStyles.clone()
            BMNode._nodeRowStyles = styles
            styles.selected().setColor("white")
            styles.unselected().setColor("#aaa")
        }
        return BMNode._nodeRowStyles
    }

    // column view style
    
    setNodeColumnBackgroundColor (c) {
	    if (this.nodeColumnStyles()) {
            this.setNodeColumnStyles(BMViewStyles.clone())
	    }
	    
        this.nodeColumnStyles().selected().setBackgroundColor(c)
        this.nodeColumnStyles().unselected().setBackgroundColor(c)
        return this
    }

    nodeColumnBackgroundColor () {
	    if (this.nodeColumnStyles()) {
		    return this.nodeColumnStyles().selected().backgroundColor()
	    }
	    return null
    }
    
    // -----------------------
    
    nodeVisibleClassName () {
        if (this._nodeVisibleClassName) {
            return this._nodeVisibleClassName
        }
		
        return this.type().sansPrefix("BM")
    }

    // --- fields ---
    
    addLinkFieldForNode (aNode) {
        const field = BMLinkField.clone().setName(aNode.title()).setValue(aNode)
        return this.addStoredField(field)
    }
    
    addField (aField) {
        throw new Error("addField shouldn't be called - use BMFieldSetNode")
        return this.addSubnode(aField)
    }
        
    nodeRowLink () {
        // used by UI row views to browse into next column
        return this
    }

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

    thisNode () {
        return this
    }

    nodeRowLinkMethods () {
        return ["thisNode"]
    }

    defaultNodeRowLinkMethod () {

    }

    // subtitle and note
    
    subtitle () {

        if (this.subtitleIsSubnodeCount() && this.subnodesCount()) {
            return this.subnodesCount()
        }
        
        return this._subtitle
    }
    
    note () {
        if (this.noteIsSubnodeCount() && this.subnodesCount()) {
            return this.subnodesCount()
        }
        
        return this._note
    }

    nodeHeaderTitle () {
        return this.title()
    }

    // --- viewClassName ---
    
    /*
    viewClassName () {
        if (!this._viewClassName) {
            return this.type() + "View" //.sansPrefix("BM")
        }
        
        return this._viewClassName
    }
    */
    
    viewClass () {        
        const name = this.viewClassName()
        if (name) {
            return window[name]
        }

	  	return this.firstAncestorWithMatchingPostfixClass("View")
    }

    // --- nodeRowViewClass ---
    
    /*
    rowNode () {
        return this
    }
    */

    nodeRowViewClass () {   
	  	return this.firstAncestorWithMatchingPostfixClass("RowView")
    }

    // --- subnodes ----------------------------------------
    
    
    setParentNode (aNode) {
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
    }

    didChangeParentNode () {
        // for subclasses to override
    }

    subnodeCount () {
        return this._subnodes.length
    }

    hasSubnodes () {
        return this.subnodeCount() > 0
    }

    justAddSubnode (aSubnode) {
        return this.justAddSubnodeAt(aSubnode, this.subnodeCount())
    }
	
    justAddSubnodeAt (aSubnode, anIndex) {
        this.subnodes().atInsert(anIndex, aSubnode)
        aSubnode.setParentNode(this)
        return aSubnode        
    }

    addSubnodeAt (aSubnode, anIndex) {
        assert(anIndex >= 0)
        this.justAddSubnodeAt(aSubnode, anIndex)
        this.didChangeSubnodeList()
        return aSubnode
    }

    replaceSubnodeWith (aSubnode, newSubnode) {
        const index = this.indexOfSubnode(aSubnode)
        assert(index !== -1)
        this.removeSubnode(aSubnode)
        this.addSubnodeAt(newSubnode, index)
        return newSubnode
    }

    addSubnode (aSubnode) {
        return this.addSubnodeAt(aSubnode, this.subnodeCount())
    }

    addLinkSubnode (aNode) {
        if(aNode.parentNode()) {
            console.warn("adding a link subnode to a node with no parent (yet)")
        }
        const link = BMLinkNode.clone().setLinkedNode(aNode)
        this.addSubnode(link)
        return link
    }

    addSubnodes (subnodes) {
        subnodes.forEach(subnode => this.addSubnode(subnode))
        return this
    }

    addSubnodesIfAbsent (subnodes) {
        subnodes.forEach(subnode => this.addSubnodeIfAbsent(subnode))
        return this
    }
    
    addSubnodeIfAbsent (aSubnode) {
        if(!this.hasSubnode(aSubnode)) {
            this.addSubnode(aSubnode)
            return true
        }
        return false
    }

    acceptedSubnodeTypes () {
        const types = []
        if (this.subnodeProto()) {
            types.push(this.subnodeProto().type())
        }
        return types
    }

    acceptsAddingSubnode (aSubnode) {
        if (aSubnode === this) {
            return false
        }

        /*
        if (this.hasSubnode(aSubnode)) {
            return false
        }
        */
        //const type = aSunode.type()
        const ancestors = aSubnode.ancestorTypes()
        const match = this.acceptedSubnodeTypes().detect(type => ancestors.contains(type))
        return !Type.isNullOrUndefined(match)
    }
	
    isEqual (aNode) {
	    return this === aNode
    }

    hash () {
        // don't assume hash() always returns the puuid as
        // subclasses can override to measure equality in their own way
        return this.puuid()
    }

    createSubnodesIndex () {
        this.subnodes().setIndexClosure( v => v.hash() )
        return this
    }
	
    hasSubnode (aSubnode) {
        const subnodes = this.subnodes()
        if (subnodes.length > 100) {
            this.createSubnodesIndex()
            return subnodes.indexHasItem(aSubnode) 
        }
        //return subnodes.detect(subnode => subnode === aSubnode)
        return subnodes.detect(subnode => subnode.isEqual(aSubnode))
    }
    
    justRemoveSubnode (aSubnode) { // private method 
        this.subnodes().remove(aSubnode)
        
        if (aSubnode.parentNode() === this) {
            aSubnode.setParentNode(null)
        }
        
        return aSubnode
    }
    
    removeSubnode (aSubnode) {
        this.justRemoveSubnode(aSubnode)
        this.didChangeSubnodeList()
        return aSubnode
    }
    
    removeAllSubnodes () {
	    if (this.subnodeCount()) {
    		this.subnodes().slice().forEach((subnode) => {
    			this.justRemoveSubnode(subnode)
    		})
    		
            this.didChangeSubnodeList()
        }
        return this
    }

    didChangeSubnodeList () {
        //this.subnodes().forEach(subnode => subnode.didReorderParentSubnodes())
        this.didUpdateNode()
        return this
    }

    /*
    didReorderParentSubnodes () {
    }
    */

    copySubnodes (newSubnodes) {
        this.subnodes().copyFrom(newSubnodes)
        return this
    }

    nodeReorderSudnodesTo (newSubnodes) {
        this.copySubnodes(newSubnodes)
        return this
    }
    
    // --- update / sync system ----------------------------
    
    scheduleSyncToView () {
        this.didUpdateNode()
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this, "syncToView")
        return this
    }

    didUpdateNode () {
        const note = this.didUpdateNodeNote()
        if (note) {
            note.post()
        }

        if (this.parentNode()) {
            assert(this.parentNode() !== this)
            this.parentNode().didUpdateNode()
        }
    }

    indexOfSubnode (aSubnode) {
        return this.subnodes().indexOf(aSubnode);
    }

    subnodeIndexInParent () {
        const p = this.parentNode()
        if (p) {
            return p.indexOfSubnode(this)
        }
        return 0
    }

    nodeDepth () {
        const p = this.parentNode()
        if (p) {
            return p.nodeDepth() + 1
        }
        return 0
    }

    // --- shelf ---
	
    shelfSubnodes () {
        return []
    }

    shelfIconName () {
	    return null
    }
	
    shelfIconUrl () {
	    return null
    }

    // ---------------------------------------
    
    prepareForFirstAccess () {
        // subclasses can override 
    }

    prepareToAccess () {
        // this should be called whenever subnodes need to be accessed
        if (!this._didPrepareForFirstAccess) {
            this._didPrepareForFirstAccess = true
            this.prepareForFirstAccess()
        }
    }
    
    prepareToSyncToView () {
        this.prepareToAccess();
    }

    // --- parent chain notifications ---
    
    tellParentNodes (msg, aNode) {
        const f = this[msg]
        if (f && f.apply(this, [aNode])) {
            return
        }

        const p = this.parentNode()
        if (p) {
            p.tellParentNodes(msg, aNode)
        }
    }
    
    // --- node path ------------------------
    
    nodePath () {
        if (this.parentNode()) {
            const parts = this.parentNode().nodePath()
            parts.push(this)
            return parts
        }
        return [this]
    }
    
    nodePathString () {
        return this.nodePath().map(function (node) { return node.title() }).join("/")
        //return this.nodePath().map(function (node) { return node.type() }).join("/")
    }
    
    nodeAtSubpathString (pathString) {
        return this.nodeAtSubpath(pathString.split("/"));        
    }
    
    nodeAtSubpath (subpathArray) {
        if (subpathArray.length > 0) {
            const subnode = this.firstSubnodeWithTitle(subpathArray[0])
            if (subnode) {
                return subnode.nodeAtSubpath(subpathArray.slice(1))
            }
            return null
        }        
        return this
    }

    // --- log ------------------------
    
    log (msg) {
        //const s = this.nodePathString() + " --  " + msg
        if (this.isDebugging()) {
        	console.log("[" +  this.nodePathString() + "] " + msg)
        }
    }
    
    // --- standard actions -----------------------------
    
    addAction (actionString) {
        if (!this.actions().contains(actionString)) {
	        this.actions().push(actionString)
            this.didUpdateNode()
        }
        return this
    }

    removeAction (actionString) {
        if (this.actions().contains(actionString)) {
        	this.actions().remove(actionString)
            this.didUpdateNode()
        }
        return this
    }
    
    addActions (actionStringList) {
        actionStringList.forEach( (action) => {
            this.addAction(action)
        })
        return this
    }
    
    hasAction (actionName) {
        return this.actions().contains(actionName)
    }
    
    performAction (actionName) {
        return this[actionName].apply(this)
    }
    
    postShouldFocusSubnode (aSubnode) {
        this.shouldFocusSubnodeNote().setInfo(aSubnode).post()
        return this
    }
    
    justAddAt (anIndex) {  
        const newSubnode = this.subnodeProto().clone()
        this.addSubnodeAt(newSubnode, anIndex)
        return newSubnode
    }

    justAdd (anIndex) {  
        return this.justAddAt(this.subnodeCount())
    }

    addAt (anIndex) {
        const newSubnode = this.justAddAt(anIndex)
        this.didUpdateNode()
        this.postShouldFocusSubnode(newSubnode)
        return newSubnode
    }

    add () {  
        return this.addAt(this.subnodeCount())
    }

    removeFromParentNode () {
        if (this.parentNode()) {
            this.parentNode().removeSubnode(this)
        } else {
            throw new Error("missing parentNode")
        }
        return this
    }
	
    delete () {
        this.removeFromParentNode()
        return this
    }

    /*
    nodeParentHasDeleteAction () {
        const p = this.parentNode()
        return p && p.hasAction("delete")
    }
    */

    /*
    canDelete () {
        if (this._canDelete) {
            return true
        }

        return this.nodeParentHasDeleteAction()
    }
    */

    canSelfAddSubnode () {
        return this.hasAction("add")
    }

    // --- utility -----------------------------
    
    parentNodeOfType (className) {
        if (this.type() === className) {
            return this
        }
        
        if (this.parentNode()) {
            return this.parentNode().parentNodeOfType(className)
        }
        
        return null
    }

    parentNodes () {
        const node = this.parentNode()
        const results = []
		
        while (node) {
            results.push(node)
            node = this.parentNode()
        }
        return results
    }
	
    parentNodeTypes () {
        return this.parentNodes().map(node => node.type())
    }
    
    // --- subnode lookup -----------------------------
    
    subnodesSans (aSubnode) {
	    return this.subnodes().select(subnode => subnode !== aSubnode)
    }
	
    firstSubnodeOfType (aProto) {
        return this.subnodes().detect(subnode => subnode.type() === aProto.type())
    }

    firstSubnodeWithTitle (aString) {
        return this.subnodes().detect(subnode => subnode.title() === aString)
    }

    firstSubnodeWithSubtitle (aString) {
        return this.subnodes().detect(subnode => subnode.subtitle() === aString)
    }

    subnodeWithTitleIfAbsentInsertClosure (aString, aClosure) {
        let subnode = this.firstSubnodeWithTitle(aString)

        if (!subnode && aClosure) {
            subnode = aClosure()
            subnode.setTitle(aString)
            this.addSubnode(subnode)
        }

        return subnode
    }
        
    sendRespondingSubnodes (aMethodName, argumentList) {
        this.subnodes().forEach((subnode) => { 
            if (subnode[aMethodName]) {
                subnode[aMethodName].apply(subnode, argumentList)
            }
        })
        return this
    }
    
    // --- subnodes -----------------------------
    
    subnodesCount () {
        return this.subnodes().length
    }

    onDidMutateObject (anObject) {
        if (anObject === this._subnodes) {
            this.didChangeSubnodeList()
        }
    }

    didUpdateSlotSubnodes (oldValue, newValue) {
        this._subnodes.addMutationObserver(this)
        this._subnodes.forEach(subnode => subnode.setParentNode(this))
        this.didChangeSubnodeList()
        return this
    }   
    
    assertSubnodesHaveParentNodes () {
        const missing = this.subnodes().detect(subnode => !subnode.parentNode())
        if (missing) {
            throw new Error("missing parent node on subnode " + missing.type())
        }
        return this
    }
	
    // --- subnode sorting ---
	
    setSubnodeSortFunc (f) {
        this.subnodes().setSortFunc(f)
	    return this
    }
	
    doesSortSubnodes () {
	    return this.subnodes().doesSort()
    }
    
    // --- subnode indexing ---
	
    lazyIndexedSubnodes () {
        if (!this.subnodes().indexClosure()) {
            this.subnodes().setIndexClosure( sn => sn.hash() )
        }
	    return this.subnodes()
    }
	
    subnodeWithHash (h) {
        return this.lazyIndexedSubnodes().itemForIndexKey(h)
    }
	
    removeSubnodeWithHash (h) {
	    const subnode = this.subnodeWithHash(h)
	    if (subnode) {
	        this.removeSubnode(subnode)
	    }
	    return this
    }
	
    hasSubnodeWithHash (h) {
	    return this.lazyIndexedSubnodes().hasIndexKey(h)
    }
    
    // --- node view badge ---

    nodeViewShouldBadge () {
        return false
    }

    nodeViewBadgeTitle () {
        return null
    }
	
    // visibility
	
    nodeBecameVisible () {
	    return this
    }

    // --- notification helpers --- 

    watchOnceForNote (aNoteName) {
        const obs = NotificationCenter.shared().newObservation()
        obs.setName(aNoteName)
        obs.setObserver(this)
        obs.setIsOneShot(true)
        obs.watch()
        //this.debugLog(".watchOnceForNote('" + aNoteName + "')")
        return obs
    }

    postNoteNamed (aNoteName) {
        const note = window.NotificationCenter.shared().newNote()
        note.setSender(this)
        note.setName(aNoteName)
        note.post()
        //this.debugLog(".postNoteNamed('" + aNoteName + "')")
        return note
    }

    scheduleSelfFor (aMethodName, milliseconds) {
        return window.SyncScheduler.shared().scheduleTargetAndMethod(this, aMethodName, milliseconds)
    }

    // -- selection requests ---

    onRequestSelectionOfDecendantNode (aNode) {
        return false // allow propogation up the parentNode line
    }

    onRequestSelectionOfNode (aView) {
        this.tellParentNodes("onRequestSelectionOfDecendantNode", this)
        return this
    }

    // tracking observer count 
    // usefull for releasing inspectors when no longer needed

    /*
    onStartObserving () {

    }

    onStopObserving () {
        const isStillObserved = NotificationCenter.shared().hasObservationsForTargetId(this.typeId())
        if (!isStillObserved) {
            this.onNoMoreObservers()
        }
    }

    onNoMoreObservers () {

    }
    */

    summary () {
        return this.title() + " " + this.subtitle()
    }

}.initThisClass()
