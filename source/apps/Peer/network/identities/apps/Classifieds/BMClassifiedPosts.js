"use strict"

/*

    BMClassifiedPosts

*/


window.BMClassifiedPosts = class BMClassifiedPosts extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setTitle("My Posts")
        this.setSubnodeProto(BMClassifiedPost)
        this.setNoteIsSubnodeCount(true)
    }

}.initThisClass()
