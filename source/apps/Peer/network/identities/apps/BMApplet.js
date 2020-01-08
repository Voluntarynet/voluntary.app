
"use strict"

/*

    BMApplet

*/

window.BMApplet = class BMApplet extends BMStorableNode {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setShouldStore(true)
        return this
    } 

    sharedStoredInstance () {
        return this.defaultStore().rootInstanceWithPidForProto(this.type(), this)
    }

    handleAppMsg (aMessage) {
        // override
    }
	
    allIdentitiesMap () { // only uses valid remote identities
        const ids = ideal.Dictionary.clone()
        return ids
    }

}.initThisClass()

