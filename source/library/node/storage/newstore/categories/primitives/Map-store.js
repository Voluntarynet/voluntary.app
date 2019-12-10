"use strict"

Object.defineSlots(Map.prototype, {

    recordForStore: function(aStore) { // should only be called by Store
        return {
            type: Type.typeName(this), 
            v: this.map(v => aStore.refValue(v))
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


Object.defineSlots(Map, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "Map")
        return aRecord.v.map(v => aStore.unrefValue(v))
    },

})

