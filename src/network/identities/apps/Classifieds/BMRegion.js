/*
	BMRegion represents a regional market category (Country, State, City, etc)
	It does some tricks with lazy loading children as needed so we don't have to read everything in immediately.
	If can also propogate subnode count sum updates.
*/

"use strict"

window.BMRegion = BMNode.extend().newSlots({
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
        let sum = 0
        this.subnodes().forEach((subnode) => {
            if (subnode.title() == "All") {
                return;
            }
            
            if (subnode.type() == "BMRegion") {
                let v = subnode.note()
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

    didUpdateNode: function() {
        this.setNote(this.sumOfSubnodeNotes())
        BMNode.didUpdateNode.apply(this)
        return this
    },
    
    setNodeDict: function(aDict) {
        this.setTitle(aDict.name.titleized())
        this.setAllowsSubregions(aDict._allowsSubregions != false) // All
        //this.setNoteIsSubnodeCount(aDict._allowsSubregions == false) // All
        this.addChildrenDicts(aDict.children)
        return this
    },
    
    addChildrenDicts: function(children) {
        if (children) {
            let max = children.length
            for(let i = 0; i < max; i++) {
                let childDict = children[i]
                //let child = window[childDict._type].clone().setNodeDict(childDict)
                let child = BMRegion.clone().setNodeDict(childDict)
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
            //this._subnodes.forEach( (subnode) => { subnode.setNoteIsSubnodeCount(true) }) // Categories
            //this.addChildrenDicts(aDict.children)
        } else {
            this._subnodes.forEach((subnode) => { subnode.onLeavesAddDictChildren(aDict) })
        }
        return this
    },
    
    setupCategoryLeaves: function() {
        if (this._subnodes.length == 0) {
            this.addAction("add")
            this.setSubnodeProto(BMClassifiedPost)
        } else {
            this._subnodes.forEach((subnode) => { subnode.setupCategoryLeaves() })
        }
    },

    prepareToAccess: function() {
        if(this._lazyChildrenDict != null) {
            console.log(this.type() + " " + this.title() + " lazy load")
            let ld = this._lazyChildrenDict
            this._lazyChildrenDict = null
            this.addChildrenDicts(ld.children)
            this.setupCategoryLeaves()
        }        
    },
    
    postPathString: function() {
        let path = this.nodePath()
        path.removeFirst()
        let pathString = path.map(function (p) { return p.title() }).join("/")	
        return pathString
    },
	
    add: function () {  
        /*
        let sell = BMSell.clone()
        App.shared().sells().addSubnode(sell)
        App.shared().browser().selectNode(sell)
        let post = sell.post()
        */

        let post = BMClassifiedPost.clone()
        post.setPath(this.postPathString())
        post.setIsEditable(true)
        App.shared().appNamed("Classifieds").sells().addSubnode(post)
        App.shared().browser().selectNode(post)

        if (this.title() == "Tests") {
            post.fillWithTestData()
        }

        return null
    },
    
})

window.Region = BMRegion
