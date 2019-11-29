
"use strict"

/*

    BMFollowingContact

*/

window.BMFollowingContact = class BMFollowingContact extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            isFollowing: false,
        })
        this.protoAddStoredSlot("isFollowing")
    }

    init () {
        super.init()
    }

    title () {
        return this.remoteIdentity().title()
    }
    
}.initThisClass()

