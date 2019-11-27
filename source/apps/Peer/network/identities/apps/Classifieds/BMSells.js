"use strict"

/*

    BMSells

*/

window.BMSells = class BMSells extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
		
        //this.setTitle("Sells")
        this.setTitle("My Sales")
        //this.setActions(["add"])
        this.setSubnodeProto(BMSell)
        this.setNoteIsSubnodeCount(true)
    }

}.initThisClass()
