"use strict"

/*

    AtomicDictionary

*/

window.ideal.AtomicDictionary = class AtomicDictionary extends ideal.Dictionary {

    init () {
        super.init()
        this.newSlot("hasBegun", false) // private method
        this.newSlot("oldVersion", null) // private method
    }

    begin () {
        this.assertNotInTx()
        this.setOldVersion(this.jsMap().shallowCopy()) // so no one else has a reference to our copy
        this.setJsMap(this.jsMap().shallowCopy())
        this.setHasBegun(true)
        return this
    }

    revert() {
        this.assertInTx()
        this.setJsMap(this.oldVersion()) // rever to old version
        this.setOldVersion(null)
        this.setHasBegun(false)
        return this
    }

    commit () {
        this.assertInTx()
        this.setOldVersion(null) // no more need for old version
        this.setHasBegun(false)
        return this
    }

    // just need to make sure writes happen within a transaction

    assertInTx () { // private
	    assert(this.hasBegun())
    }

    assertNotInTx () { // private
	    assert(!this.hasBegun())
    }

    atPut (k, v) {
        this.assertInTx()
        return super.atPut(k, v)
    }

    removeKey (k) {
        this.assertInTx()
        return this.removeKey(k);
    }

    test () {

    }
}

window.ideal.AtomicDictionary.registerThisClass()