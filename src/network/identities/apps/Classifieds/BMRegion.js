/*
	BMRegion represents a regional market category (Country, State, City, etc)
	It does some tricks with lazy loading children as needed so we don't have to read everything in immediately.
	If can also propogate subitem count sum updates.
*/

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
    
    sumOfSubnodeNotes: function() {
        var sum = 0
        this.subnodes().forEach(function (item) {
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
        if (this._subnodes.length) {
            if (this._subnodes[0].compare) {
                this._subnodes = this._subnodes.sort(function (a, b) {
                    return a.compare(b)
                })
            }
        }
    },
    
    addSubnode: function(aSubnode) {
        BMNode.addSubnode.apply(this, [aSubnode])
        this.sortIfNeeded()
        return aSubnode
    },

    didUpdate: function() {
        this.setNote(this.sumOfSubnodeNotes())
        BMNode.didUpdate.apply(this)
        return this
    },
    
    setNodeDict: function(aDict) {
        this.setTitle(aDict.name.titleized())
        this.setAllowsSubregions(aDict._allowsSubregions != false) // All
        //this.setNnoteIsSubnodeCount(aDict._allowsSubregions == false) // All
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
                this.justAddSubnode(child)
            }
        }  
    },
    
    onLeavesAddDictChildren: function(aDict) {
        if (!this.allowsSubregions()) {
            return this
        }
        if (this._subnodes.length == 0) {
            this._lazyChildrenDict = aDict
            //this._subnodes.forEach(function (item) { item.setNnoteIsSubnodeCount(true) }) // Categories
            //this.addChildrenDicts(aDict.children)
        } else {
            this._subnodes.forEach(function (item) { item.onLeavesAddDictChildren(aDict) })
        }
        return this
    },
    
    setupCategoryLeaves: function() {
        if (this._subnodes.length == 0) {
            this.addAction("add")
            this.setSubnodeProto(BMClassifiedPost)
        } else {
            this._subnodes.forEach(function (item) { item.setupCategoryLeaves() })
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
    
	postPathString: function() {
        var path = this.nodePath()
        path.removeFirst()
        var pathString = path.map(function (p) { return p.title() }).join("/")	
		return pathString
	},
	
    add: function () {  
		/*
        var sell = BMSell.clone()
        App.shared().sells().addSubnode(sell)
        App.shared().browser().selectNode(sell)
        var post = sell.post()
        */

		var post = BMClassifiedPost.clone()
        post.setPath(this.postPathString())
        post.setIsEditable(true)
        App.shared().appNamed("Classifieds").sells().addSubnode(post)
        App.shared().browser().selectNode(post)

		if (this.title() == "Tests") {
			post.fillWithTestData()
		}

        return null
    },
    
    containsSubnode: function(aSubnode) {
        return this.subnodes().detect(function(item) { return item.isEqual(aSubnode) })
    },
    
})

window.Region = BMRegion
