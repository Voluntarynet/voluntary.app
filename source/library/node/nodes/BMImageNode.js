"use strict"

/*

    BMImageNode
    
*/

window.BMImageNode = class BMImageNode extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            dataURL: null,
        })
    }

    init () {
        super.init()
        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)
        this.setNodeMinWidth(200)
        this.setTitle("Untitled")
        this.setSubtitle(null)
        
        this.addActions(["add"])
        this.setCanDelete(true)
        this.addStoredSlots(["title", "dataURL"])
    },        
    
    onDidEditNode () {
        this.debugLog(" onDidEditNode")
        this.scheduleSyncToStore()
    }
    
}.initThisClass()
