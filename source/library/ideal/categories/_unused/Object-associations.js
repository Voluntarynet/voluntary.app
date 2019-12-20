//"use strict"

/*

    Objective-C like associations

*/

Object.defineSlots(Object, {

    _allAssociations: new WeakMap(),
    
})

// ------------


Object.defineSlots(Object.prototype, {
    
    associations: function () {
        const m = Object._allAssociations

        if (!m.has(this)) {
            m.set(this, {})
        }

        return m.get(this)
    },

    associationAt: function (k) {
        return this.associations()[k]
    },

    associationAtPut: function(k, v) {
        this.associations()[k] = v
        return this
    },

})

