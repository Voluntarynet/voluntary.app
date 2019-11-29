"use strict"

/*

    BMImageNode
    
*/

window.BMImageNode = class BMImageNode extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            dataURL: null,
        })

        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)
        this.setNodeMinWidth(200)
        this.setTitle("Untitled")
        this.setSubtitle(null)

        this.setCanDelete(true)
        this.protoAddStoredSlots(["title", "dataURL"])
    }

    init () {
        super.init()
        this.addActions(["add"])
    }
    
    onDidEditNode () {
        this.debugLog(" onDidEditNode")
        this.scheduleSyncToStore()
    }
    
}.initThisClass()
