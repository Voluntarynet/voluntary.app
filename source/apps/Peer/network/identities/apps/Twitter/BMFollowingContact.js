
"use strict"

/*

    BMFollowingContact

*/

window.BMFollowingContact = class BMFollowingContact extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("isFollowing", false).setShouldStoreSlot(true)
    }

    init () {
        super.init()
    }

    title () {
        return this.remoteIdentity().title()
    }
    
}.initThisClass()

