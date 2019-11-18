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

    storeJsonRefs: function(puuids = new Set()) {
        this.forEach(v => { 
            if (!Type.isNull(v)) { 
                v.storeJsonRefs(puuids)
            } 
        })
        return puuids
    },
})


Object.defineSlots(Array, {

    fromIterator: function(iterator) {
        const values = []
        let result = iterator.next()
        while (!result.done) {
            values.push(result.value)
            result = iterator.next()
        }
        return values
    },
    
    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "Array")
        return aRecord.v.map(v => aStore.unrefValue(v))
    },

})

