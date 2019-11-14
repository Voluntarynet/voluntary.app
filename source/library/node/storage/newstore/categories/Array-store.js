"use strict"

Object.defineSlots(Array.prototype, {

    recordForStore: function(aStore) { // should only be called by Store
        return {
            type: Type.typeName(this), 
            v: this.map(v => aStore.refValue(v))
        }
    },

    shouldStore: function() {
        return true
    },
    
})


Object.defineSlots(Array, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "Array")
        return aRecord.v.map(v => aStore.unrefValue(v))
    },

})

