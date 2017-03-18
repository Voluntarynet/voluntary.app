
NodeView = Div.extend().newSlots({
    type: "NodeView",
    node: null,
    ownsView: true,
}).setSlots({
    init: function () {
        Div.init.apply(this)
        this._nodeObservation = NotificationCenter.shared().newObservation().setName("didUpdateNode").setObserver(this)
        return this
    },

    setNode: function(aNode) {
        this._node = aNode
        if (aNode && this.ownsView()) { 
            //this.log(aNode.type() + " setView")
            aNode.setView(this) 
        }
        
        if (aNode) { 
            this._nodeObservation.setTarget(aNode._uniqueId).watch()
        } else {
            this._nodeObservation.stopWatching()
        }

        return this
    },
    
    willRemove: function() {
        Div.willRemove.apply(this)
        this._nodeObservation.stopWatching()
        return this
    },
    
    
    itemProto: function() {
        if (this.node()) {
            var vc = this.node().nodeRowViewClass()
            if (vc) { 
                return vc
            }
        }
        return Div.itemProto.apply(this)
    },

/*
    syncFromNode: function () {
        if (!this.node()) { 
            this.removeAllItems();
            return
        }

        var subnodes = this.node().items()
        for (var i = 0; i < subnodes.length; i++) {
            var subnode = subnodes[i]
            var item = this.itemForNode(subnode)

            item.setNode(subnode).syncFromNode()
        }
        
        
        return this
    },
    */
    
    /*
    syncFromNode_: function () {
        this.removeAllItems()

        if (this.node()) {
            var subnodes = this.node().items()
            for (var i = 0; i < subnodes.length; i++) {
                var subnode = subnodes[i]
                var item = this.addItem()
                //console.log(this.type() + " addItemView " + item.type() + " forItem " + nodeItem.type())
                item.setNode(subnode).syncFromNode()
            }
        }
        
        return this
    },
    */
    
    syncFromNode: function () {
        // only replace items if sync requires it
        
        if (!this.node()) { 
            this.removeAllItems();
            return
        }
        
        this.node().prepareToSyncToView()
       
        var newItems = []
        var subnodes = this.node().items()
        
        for (var i = 0; i < subnodes.length; i++) {
            var subnode = subnodes[i]
            var item = this.itemForNode(subnode)
            
            if (!item) {
                item = this.newItemForNode(subnode).syncFromNode()
            } else {
                item.syncFromNode()
            }
            
            if(item == null) {
                throw "null item"
            }
            
            newItems.push(item)      
        }
        
        if (!newItems.isEqual(this.items())) {
            this.removeAllItems()
            this.addItems(newItems)
        } else {
            //this.log(" view items equal")
        }

        return this
    },
    
    syncToNode: function () {
        var node = this.node()
        if (node) {
            node.didUpdate()
            node.markDirty()
        }
        return this
    },

    didUpdateNode: function () {
        //console.log(this.type() + " didUpdateNode " + this.node().type())
        this.syncFromNode()
    },
    
    logName: function() {
        return this.type()
    },
    
    log: function(msg) {
        var s = "[" + this.logName() + "] " + msg
        console.log(s)
        return this
    },
    
    onDropFiles: function(filePaths) {
        var node = this.node()
        if (node && node.onDropFiles) {
            node.onDropFiles(filePaths)
        }
        return this
    },
    
})
