
"use strict"

/*

    BMFollowingContact

*/

window.BMFollowingContact = class BMFollowingContact extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            isFollowing: false,
        })
    }

    init () {
        super.init()
        this.addStoredSlot("isFollowing")
    }

    title () {
        return this.remoteIdentity().title()
    }
    
}.initThisClass()

