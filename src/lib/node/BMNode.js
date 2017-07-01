BMNode = ideal.Proto.extend().newSlots({
    type: "BMNode",
        
	// node summary presented in parent row views
    title: null,
    subtitle: null,
    note: null,
    subtitleIsItemCount: false,
    noteIsItemCount: false,
    nodeTitleIsEditable: false,
    nodeSubtitleIsEditable: false,
	nodeRowIsSelectable: true,

	nodeVisibleClassName: "",
    nodeMinWidth: 200,

    parentNode: null,

    view: null,
    viewClassName: null,

	// items
    items: null,
    subnodeProto: null,
    nodeEmptyLabel: null, // shown in view when there are no items

	// actions
    actions: null,

    // sync
    needsSyncToView: false, 

	// html
    acceptsFileDrop: false,
    
    // these should all move to Field properties?
    // new inline custom view support...
	nodeOverrideDivClassName: null,

    nodeMinHeight: 0, // tall fields like draft body

    nodeContent: null,
/*
    nodeAfterContent: null,
    nodeBeforeContent: null,
*/
    nodeBgColor: null,
        
	// persistence 
    pid: null,
	shouldStore: false,
	
	// debug
    debug: false,
}).setSlots({
    init: function () {
        this._items = []
        this._actions = []        
        this._didUpdateNodeNote = NotificationCenter.shared().newNotification().setSender(this._uniqueId).setName("didUpdateNode")
        return this
    },    
    
    addLinkFieldForNode: function(aNode) {
        var field = BMLinkField.clone().setName(aNode.title()).setValue(aNode)
        return this.addStoredField(field)
    },
    
    addField: function(aField) {
		throw "shouldn't be called"
        return this.addItem(aField)
    },
        
    nodeRowLink: function() {
        return this
    },    
    
    subtitle: function () {
        if (this.subtitleIsItemCount() && this.itemsLength()) {
            return this.itemsLength()
        }
        
        return this._subtitle
    },
    
    note: function () {
        if (this.noteIsItemCount() && this.itemsLength()) {
            return this.itemsLength()
        }
        
        return this._note
    },
    
    viewClassName: function() {
        if (!this._viewClassName) {
            return this.type() + "View" //.prefixRemoved("BM")
        }
        
        /*
        if (this.itemsLength() == 0) {
            return "GenericView"
        }
        */
        
        //console.log("this._viewClassName = " + this._viewClassName)
        
        return this._viewClassName
    },
    
    viewClass: function () {        
        var name = this.viewClassName()
        if (name) {
            return window[name]
        }
        
        return null
    },
    
    nodeRowViewClass: function () {     
        var name = this.nodeOverrideDivClassName()
        if (name) {
            return window[name]
        }
		name = this.type() + "RowView"
		if (window[name]) {
			return window[name]
		}
        
        return null
    },
    
    justAddItem: function(anItem) {
        if (this.items() == null) {
            throw new Error("items is null")
        }
        this.items().push(anItem)
        anItem.setParentNode(this)
        return anItem        
    },

    addItem: function(anItem) {
        this.justAddItem(anItem)
        this.didChangeItemList()
        return anItem
    },

	addItemsIfAbsent: function(items) {
		items.forEach((item) => { this.addItemIfAbsent(item) })
		return this
	},
    
    addItemIfAbsent: function(anItem) {
        if(!this.items().contains(anItem)) {
            this.addItem(anItem)
        }
        return anItem
    },

	addItemProtoForSlotIfAbsent: function(aProto, slotName) {
		var getter = this[slotName]
		if (!getter) {
			throw new Error(this.type() + "." + slotName + " slot missing")
		}
		
		var slotValue = this[slotName].apply(this)
		assert(aProto)
		
		//console.log("addItemProtoForSlotIfAbsent " + slotName + " = " + slotValue + " type " + typeof(slotValue) + " " + typeof(slotValue))
		
		if (slotValue === null) {
			console.log("addItemProtoForSlotIfAbsent " + slotName + " adding")
			var obj = aProto.clone()
			var setterName = this.setterNameForSlot(slotName)
			this[setterName].apply(this, [obj])
			this.addItem(obj)
		}
		
		return this
	},
    
    removeItem: function(anItem) {
        this.items().remove(anItem)
        
        if (anItem.parentNode() == this) {
            anItem.setParentNode(null)
        }
        
        this.didChangeItemList()
        return anItem
    },

    didChangeItemList: function() {
        this.markDirty()
        this.didUpdate()
        return this
    },
    
    // --- update system ---
    
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
        this._didUpdateNodeNote.post()

        this.setNeedsSyncToView(true)
        //this.markDirty()

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
            this.view().didUpdateNode()
        }        
    },
    
    prepareToAccess: function() {
        
    },
    
    prepareToSyncToView: function() {
        this.prepareToAccess();
    },
    
    tellParents: function(msg, item) {
        var f = this[msg]
        if (f && f.apply(this, [item])) {
            return
        }

        var p = this.parentNode()
        if (p) {
            p.tellParents(msg, item)
        }
    },
    
    
    // ------------------------
    
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
            var item = this.firstItemWithTitle(subpathArray[0])
            if (item) {
                return item.nodeAtSubpath(subpathArray.slice(1))
            }
            return null
        }        
        return this
    },
    
    log: function(msg) {
        //var s = this.nodePathString() + " --  " + msg
		if (this.debug()) {
        	console.log("[" +  this.nodePathString() + "] " + msg)
		}
    },
    
    // standard actions
    
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
        var subnode = this.subnodeProto().clone()
        console.log("BMNode add " + subnode.type())
        this.addItem(subnode)
        this.didUpdate()
        return subnode
    },

    delete: function () {
        this.parentNode().removeItem(this)
        return this
    },
    
    parentNodeOfType: function(className) {
        if (this.type() == className) {
            return this
        }
        
        if (this.parentNode()) {
            return this.parentNode().parentNodeOfType(className)
        }
        
        return null
    },
    
    // item lookup
    
    firstItemOfType: function(aProto) {
        this.prepareToAccess(); // put guard on items instead?

        return this.items().detect(function (item) {
            return item.type() == aProto.type()
        })
    },

    firstItemWithSubtitle: function(aString) {
        this.prepareToAccess(); // put guard on items instead?

        return this.items().detect(function (item) {
            return item.subtitle() == aString
        })
    },
        
    firstItemWithTitle: function(aString) {
        this.prepareToAccess(); // put guard on items instead?

        return this.items().detect(function (item) {
            return item.title() == aString
        })
    },
    
    
    // items
    
    
    itemsLength: function() {
        return this._items.length
    },
    
    setItems: function(items) {
        this._items = items
        //this.verifyItemsHaveParentNodes()
        return this
    },

    
    verifyItemsHaveParentNodes: function() {
        var missing = this.items().detect(function (item) { return !item.parentNode() })
        if (missing) {
            throw new Error("missing parent node on item " + missing.type())
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
            children: this.itemPids()
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
	
    itemPids: function() {
        var pids = []
        
        // only items with shouldStore ==  true
        this.items().forEach((item) => {
            if (item.shouldStore() == true) {
                pids.push(item.pid())
            }
        })
        
        /*
        var pids = this.items().map(function (item) { 
            return item.pid()
        })
        */
        
        //console.log("pids: " +  JSON.stringify(pids))
        return pids
    },
    
    setItemPids: function(pids) {
        var items = pids.map((pid) => {
            return NodeStore.shared().objectForPid(pid).setParentNode(this)
        })

		//items.forEach(function (item) { this.addItem(item) }) // this will cause an infinite loop?
        this.setItems(items)
        return this
    },
})
