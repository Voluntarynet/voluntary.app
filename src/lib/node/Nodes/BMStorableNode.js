
BMStorableNode = BMNode.extend().newSlots({
    type: "BMStorableNode",
    storedSlots: null, // dict
    shouldStoreItems: true,
    loadsUnionOfChildren: false,
    isUnserializing: false,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setStoredSlots([])
    },
    
    initStoredSlotWithProto: function(name, proto) {
        var obj = proto.clone()
        this.newSlot(name, obj)
        this.justAddItem(obj)
        this.addStoredSlot(name)
        return this
    },
    
    addStoredSlots: function(slotNames) {
        slotNames.forEach((slotName) => {
            this.addStoredSlot(slotName)
        })
        return this
    },
    
    addStoredSlot: function(slotName) {
        this.storedSlots()[slotName] = true
		// Note: BMStorableNode hooks didUpdateSlot() to call markDirty on updates. 
        return this
    },
    
    removeStoredSlot: function(slotName) {
        delete this.storedSlots()[slotName]
        return this
    },

    nodeDictForProperties: function () {
        var dict = { }
        dict.type = this.type()
 
        //console.log(this.type() + " storedSlots = " + JSON.stringify(this.storedSlots()))
       
		var slots = this.storedSlots()
		for (var k in slots) {
			if (slots.hasOwnProperty(k)) {
	            var v = null
	            if (k.beginsWith("_")) {
	                v = this[k]
	            } else {
	                v = this[k].apply(this)
	            }
            
	            dict[k] = NodeStore.shared().refValueIfNeeded(v)
			}
        }
        
        return dict
    },

    nodeDictForChildren: function () {
        var dict = { }
        dict.type = this.type()
                
        if (this.items().length && this.shouldStoreItems()) {
            dict.children = this.itemPids()
        }
        
        return dict
    },   

    nodeDict: function () {
        var dict = this.nodeDictForProperties()
        var childrenDict = this.nodeDictForChildren()
        
        if (childrenDict.children) {
            dict.children = childrenDict.children
        }
        
        return dict
    },
    
    setNodeDictForProperties: function (aDict) {
        for (var k in aDict) {
          if (aDict.hasOwnProperty(k)) {
            if (k != "children" && k != "type") {
                var v = aDict[k]
                 v = NodeStore.shared().unrefValueIfNeeded(v)
                
                if (k.beginsWith("_")) {
                    this[k] = v
                } else {
                    var setter = "set" + k.capitalized();
                    if (this[setter]) {
                        this[setter].apply(this, [v])
                    } else {
                        console.error(this.type() + " missing setter " + setter)
                        console.log("dict = " + JSON.stringify(aDict))
                    }
                }
            }
          }
        }
   
        return this
    },

    setNodeDictForChildren: function (aDict) {
        
        var newPids = aDict.children
        if (newPids) {
            if (this.loadsUnionOfChildren()) {
                newPids = this.itemPids().union(newPids)
            }
            
            this.setItemPids(newPids)
        }
        return this
    },
    
    setNodeDict: function (aDict) {   
	    BMNode.setNodeDict.apply(this, [aDict])
        this.setIsUnserializing(true) 
        this.setNodeDictForProperties(aDict)
        this.setNodeDictForChildren(aDict)
		this.didLoadFromStore()
        this.setIsUnserializing(false) 
        return this
    },
    
    didLoadFromStore: function() {
		//console.log(this.type() + " didLoadFromStore in BMStorableNode")
        // a chance to finish any unserializing
    },

	markDirty: function() {
		if (!this._isUnserializing) { 
			BMNode.markDirty.apply(this)
		}
		return this
	},
	
	didUpdateSlot: function(slotName, oldValue, newValue) {
		// check so we don't mark dirty while loading
		// and use private ivars directly for performance
		if (slotName in this._storedSlots) { 
			this.markDirty()
		}
	},
})

BMListNode = BMStorableNode
