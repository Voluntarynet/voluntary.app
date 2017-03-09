
BMRegion = BMNode.extend().newSlots({
    type: "BMRegion",
    lazyChildrenDict: null
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(160)
        //this.setSubnodeProto(BMPost)
    },

    setNodeDict: function(aDict) {
        this.setTitle(aDict.name.titleized())
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
        if (this._items.length == 0) {
            this._lazyChildrenDict = aDict
            //this.addChildrenDicts(aDict.children)
        } else {
            this._items.forEach(function (item) { item.onLeavesAddDictChildren(aDict) })
        }
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

        var subnode = this.subnodeProto().clone()
        var path = this.nodePath()
        path.removeFirst()
        var pathString = path.map(function (p) { return p.title() }).join("/")
        subnode.setPath(pathString)
        subnode.setIsEditable(true)
        App.shared().myPosts().addItem(subnode)
        App.shared().browser().selectNode(subnode)
        return subnode
    },
    
    containsItem: function(anItem) {
        return this.items().detect(function(item) { return item.isEqual(anItem) })
    },
    
})

window.Region = BMRegion
