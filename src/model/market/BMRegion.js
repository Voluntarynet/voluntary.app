
BMRegion = BMNode.extend().newSlots({
    type: "BMRegion",
    lazyChildrenDict: null,
    allowsSubregions: true,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(160)
        //this.setSubnodeProto(BMPost)
    },
    
    sumOfItemNotes: function() {
        var sum = 0
        this.items().forEach(function (item) {
            if (item.title() == "All") {
                return;
            }
            
            if (item.type() == "BMRegion") {
                var v = item.note()
                if (v) {
                    sum += v
                }
            } else {
                sum += 1
            }
        })
        return sum
    },
    
    sortIfNeeded: function() {
        if (this._items.length) {
            if (this._items[0].compare) {
                this._items = this._items.sort(function (a, b) {
                    return a.compare(b)
                })
            }
        }
    },
    
    addItem: function(anItem) {
        BMNode.addItem.apply(this, [anItem])
        this.sortIfNeeded()
        return anItem
    },

    didUpdate: function() {
        this.setNote(this.sumOfItemNotes())
        BMNode.didUpdate.apply(this)
        return this
    },
    
    setNodeDict: function(aDict) {
        this.setTitle(aDict.name.titleized())
        this.setAllowsSubregions(aDict._allowsSubregions != false) // All
        //this.setNoteIsItemCount(aDict._allowsSubregions == false) // All
        this.addChildrenDicts(aDict.children)
        return this
    },
    
    addChildrenDicts: function(children) {
         if (children) {
            var max = children.length
            for(var i = 0; i < max; i++) {
                var childDict = children[i]
                //var child = window[childDict._type].clone().setNodeDict(childDict)
                var child = BMRegion.clone().setNodeDict(childDict)
                this.justAddItem(child)
            }
        }  
    },
    
    onLeavesAddDictChildren: function(aDict) {
        if (!this.allowsSubregions()) {
            return this
        }
        if (this._items.length == 0) {
            this._lazyChildrenDict = aDict
            //this._items.forEach(function (item) { item.setNoteIsItemCount(true) }) // Categories
            //this.addChildrenDicts(aDict.children)
        } else {
            this._items.forEach(function (item) { item.onLeavesAddDictChildren(aDict) })
        }
        return this
    },
    
    setupCategoryLeaves: function() {
        if (this._items.length == 0) {
            this.addAction("add")
            this.setSubnodeProto(BMClassifiedPost)
        } else {
            this._items.forEach(function (item) { item.setupCategoryLeaves() })
        }
    },

    prepareToAccess: function() {
        if(this._lazyChildrenDict != null) {
            console.log(this.type() + " " + this.title() + " lazy load")
            var ld = this._lazyChildrenDict
            this._lazyChildrenDict = null
            this.addChildrenDicts(ld.children)
            this.setupCategoryLeaves()
       }        
    },
    
    add: function () {  
        // set path when using add button
        //var subnode = BMNode.add.apply(this)

        var sell = BMSell.clone()
        var post = sell.post()
        var subnode = this.subnodeProto().clone()
        
        var path = this.nodePath()
        path.removeFirst()
        var pathString = path.map(function (p) { return p.title() }).join("/")
        
        post.setPath(pathString)
        post.setIsEditable(true)
        App.shared().sells().addItem(sell)
        App.shared().browser().selectNode(sell)
        return subnode
    },
    
    containsItem: function(anItem) {
        return this.items().detect(function(item) { return item.isEqual(anItem) })
    },
    
})

window.Region = BMRegion
