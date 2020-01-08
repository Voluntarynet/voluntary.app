"use strict"

/*

    Boolean-ideal

*/


Object.defineSlots(Boolean.prototype, {

    duplicate: function() {
        return this
    },
 
    // logic

    negate: function() {
        return !this
    },

    and: function(v) {
        return this && v
    },

    or: function(v) {
        return this || v
    },

    xor: function(v) {
        return ( this && !v ) || ( !this && v )
    },

    // control flow

    ifTrue: function(aClosure) { // just a test
        if (this) {
            return aClosure()
        }
        return undefined
    },

});
