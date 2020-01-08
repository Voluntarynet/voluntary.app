"use strict"

/*

    BMRegion
    
	BMRegion represents a regional market category (Country, State, City, etc)
	It does some tricks with lazy loading children as needed so we don't have to read everything in immediately.
	If can also propogate subnode count sum updates.
*/


window.BMRegion = class BMRegion extends BMNode {
    
    initPrototype () {
        this.newSlot("lazyChildrenDict", null)
        this.newSlot("allowsSubregions", true)
    }

    init () {
        super.init()
        this.setNodeMinWidth(160)
        //this.setSubnodeProto(BMPost)
        this.setSubnodeSortFunc((a, b) => { return a.compare(b) })
    }
    
    sumOfSubnodeNotes () {
        let sum = 0
        this.subnodes().forEach((subnode) => {
            if (subnode.title() === "All") {
                return;
            }
            
            if (subnode.type() === "BMRegion") {
                let v = subnode.note()
                if (v) {
                    sum += v
                }
            } else {
                sum += 1
            }
        })
        return sum
    }

    didUpdateNode () {
        this.setNote(this.sumOfSubnodeNotes())
        super.didUpdateNode()
        return this
    }
    
    /*
    setNodeDict (aDict) {
        this.setTitle(aDict.name.titleized())
        this.setAllowsSubregions(aDict._allowsSubregions !== false) // All
        //this.setNoteIsSubnodeCount(aDict._allowsSubregions === false) // All
        this.addChildrenDicts(aDict.children)
        return this
    }
    
    addChildrenDicts (children) {
        if (children) {
            const max = children.length
            for(let i = 0; i < max; i++) {
                const childDict = children[i]
                const child = BMRegion.clone().setNodeDict(childDict)
                this.justAddSubnode(child)
            }
        }  
    }
    */
    
    onLeavesAddDictChildren (aDict) {
        if (!this.allowsSubregions()) {
            return this
        }
        if (this._subnodes.length === 0) {
            this._lazyChildrenDict = aDict
            //this._subnodes.forEach( (subnode) => { subnode.setNoteIsSubnodeCount(true) }) // Categories
            //this.addChildrenDicts(aDict.children)
        } else {
            this._subnodes.forEach((subnode) => { subnode.onLeavesAddDictChildren(aDict) })
        }
        return this
    }
    
    setupCategoryLeaves () {
        if (this._subnodes.length === 0) {
            this.addAction("add")
            this.setSubnodeProto(BMClassifiedPost)
        } else {
            this._subnodes.forEach((subnode) => { subnode.setupCategoryLeaves() })
        }
    }

    prepareToAccess () {
        if(this._lazyChildrenDict != null) {
            this.debugLog(" " + this.title() + " lazy load")
            let ld = this._lazyChildrenDict
            this._lazyChildrenDict = null
            this.addChildrenDicts(ld.children)
            this.setupCategoryLeaves()
        }        
    }
    
    postPathString () {
        let path = this.nodePath()
        path.removeFirst()
        let pathString = path.map(function (p) { return p.title() }).join("/")	
        return pathString
    }
	
    add () {  
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

        if (this.title() === "Tests") {
            post.fillWithTestData()
        }

        return null
    }
    
}.initThisClass()

//window.Region = BMRegion
