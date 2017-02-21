
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
            this.setSubnodeProto(BMPost)
        } else {
            this._items.forEach(function (item) { item.setupCategoryLeaves() })
        }
    },
    

    prepareToSyncToView: function() {
        if(this._lazyChildrenDict != null) {
            console.log(this.type() + " " + this.title() + " lazy load")
            var ld = this._lazyChildrenDict
            this._lazyChildrenDict = null
            this.addChildrenDicts(ld.children)
            this.setupCategoryLeaves()
       }        
    },
    
})

window.Region = BMRegion

BMMarket = BMRegion.extend().newSlots({
    type: "BMMarket",
}).setSlots({
    init: function () {
        BMRegion.init.apply(this)
        //this.setPid("_market")
        //this.setActions(["add"])
        //this.setSubnodeProto(BMPost)
        
        /*
        this.setDigital(BMStorableNode.clone().setTitle("Digital"))
        this.justAddItem(this.digital())
        
        this.setPhysical(BMStorableNode.clone().setTitle("Physical"))
        this.justAddItem(this.physical())
        */

        //console.log("begin BMMarket init")
        //this.setNodeDict(RegionUSCitiesDict)
        this.setNodeDict(RegionCountriesDict)
        this.setTitle("Classifieds")
        //console.log("end BMMarket init")
        
        this.onLeavesAddDictChildren(CategoriesDict)
    },
    
    receivedMsgFrom: function(msg, remotePeer) {
        var postDict = JSON.parse(msg)
        var post = BMPost.clone().setPostDict(postDict)
        this.addItem(post)
        this.didUpdate() 
    }
})

