"use strict"

Object.defineSlots(Set.prototype, {

    recordForStore: function(aStore) { // should only be called by Store
        return {
            type: Type.typeName(this), 
            values: this.valuesArray().map(v => aStore.refValue(v))
        }
    },

    shouldStore: function() {
        return true
    },

    refsPidsForJsonStore: function(puuids = new Set()) {
        this.forEach(v => { 
            if (!Type.isNull(v)) { 
                v.refsPidsForJsonStore(puuids)
            } 
        })
        return puuids
    },
})


Object.defineSlots(Set, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "Set")
        const values = aRecord.values.map(v => aStore.unrefValue(v))
        return new Set(values) 
    },

})

