"use strict"

/*

    AtomicDictionary

    TODO: map dictionary operators to methods or raise exceptions?

*/

window.ideal.AtomicDictionary = class AtomicDictionary extends ideal.Dictionary {

    init () {
        super.init()
        this.newSlot("hasBegun", false) // private method
        this.newSlot("oldVersion", null) // private method
        this.newSlot("isOpen", false) // private method
        this.newSlot("keysAndValuesAreStrings", true) // private method
    }

    asyncOpen (callback) {
        this.setIsOpen(true)
        callback()
    }

    begin () {
        this.assertNotInTx()
        this.setOldVersion(this.jsDict().shallowCopy()) // so no one else has a reference to our copy
        this.setJsDict(this.jsDict().shallowCopy())
        this.setHasBegun(true)
        return this
    }

    revert() {
        this.assertInTx()
        this.setJsDict(this.oldVersion()) // rever to old version
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
        if (this.keysAndValuesAreStrings()) {
            assert(Type.isString(k))
            assert(Type.isString(v))
        }

        this.assertInTx()
        return super.atPut(k, v)
    }

    removeKey (k) {
        if (this.keysAndValuesAreStrings()) {
            assert(Type.isString(k))
        }

        this.assertInTx()
        return this.removeKey(k);
    }

    test () {

    }
}

window.ideal.AtomicDictionary.registerThisClass()