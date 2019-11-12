"use strict"

/*

    MemStore

    Implements ClientStore protocol but only holds records in
    in-memory dictionary instead of writing to persistent storage.

    This can be useful for constructing a copy store when dragging nodes out of the browser.

    Atomic Dictionary protocol:

    	asyncOpen()
		isOpen()
		begin()
		commit()
		at(key) // return dict
		atPut(key, dict)
		removeAt(key)
		clear()
*/

ideal.Proto.newSubclassNamed("MemStore").newSlots({
    dict: null, 
    isOpen: false,
    hasBegun: false,
}).setSlots({
    init: function() {
        ideal.Proto.init.apply(this)
        this.setdict({})
    },

    asyncOpen: function(callback) {
        this.setIsOpen(true)
        callback()
    },

    begin: function() {
        assert(!this.hasBegun())
        this.setHasBegun(true)
        return this
    },

    begin: function() {
        assert(!this.hasBegun())
        this.setHasBegun(true)
        return this
    },

    commit: function() {
        assert(this.hasBegun())
        this.setHasBegun(false)
        return this
    },

    at: function(k) {
        return this.dict()[k]
    },

    atPut: function(k, v) {
        this.dict()[k] = v
        return this
    },

    removeAt: function(k) {
        delete this.dict()[k]
        return this
    },

    clear: function(k, v) {
        this.setDict({})
        return this
    },
})

