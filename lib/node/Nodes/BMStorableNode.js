
BMStorableNode = BMNode.extend().newSlots({
    type: "BMStorableNode",
    storedSlots: null,
    shouldSerializeChildren: true,
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
        var self = this
        slotNames.forEach(function(slotName) {
            self.addStoredSlot(slotName)
        })
        return this
    },
    
    addStoredSlot: function(slotName) {
        this.storedSlots().appendIfAbsent(slotName)
        /*
        if (this.pdbWatchSlot) {
            this.pdbWatchSlot(slotName)
        }
        */
        return this
    },
    
    removeStoredSlot: function(slotName) {
        this.storedSlots().remove(slotName)
        /*
        if (this.pdbUnwatchSlot) {
            this.pdbUnwatchSlot(slotName)
        }
        */
        return this
    },

    nodeDictForProperties: function () {
        var dict = { }
        dict.type = this.type()
 
        //console.log(this.type() + " storedSlots = " + JSON.stringify(this.storedSlots()))
       
        var self = this
        this.storedSlots().forEach(function (k) {
            var v = self[k]

            if (k.beginsWith("_")) {
                v = self[k]
            } else {
                v = self[k].apply(self)
            }
            
            dict[k] = NodeStore.shared().refValueIfNeeded(v)
        })
        
        return dict
    },

    nodeDictForChildren: function () {
        var dict = { }
        dict.type = this.type()
                
        if (this.items().length && this.shouldSerializeChildren()) {
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
        var self = this
        
        for (var k in aDict) {
          if (aDict.hasOwnProperty(k)) {
            if (k != "children" && k != "type") {
                var v = aDict[k]
                 v = NodeStore.shared().unrefValueIfNeeded(v)
                
                if (k.beginsWith("_")) {
                    self[k] = v
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
        var self = this
        
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
        this.setIsUnserializing(true) 
        this.setNodeDictForProperties(aDict)
        this.setNodeDictForChildren(aDict)
        this.didLoad() // a chance to finish
        this.setIsUnserializing(false) 
        return this
    },
    
    didLoad: function() {
        
    },

})

BMListNode = BMStorableNode
