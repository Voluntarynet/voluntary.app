
"use strict"

/*

    BMSent

*/

window.BMSent = class BMSent extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
 		this.setShouldStore(true)
 		this.setShouldStoreSubnodes(false)
        this.setNoteIsSubnodeCount(true)
        this.setTitle("sent")
    }
    
}.initThisClass()