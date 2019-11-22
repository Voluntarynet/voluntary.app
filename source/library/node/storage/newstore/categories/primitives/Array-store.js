"use strict"

Object.defineSlots(Array.prototype, {

    recordForStore: function(aStore) { // should only be called by Store
        return {
            type: Type.typeName(this), 
            values: this.map(v => aStore.refValue(v))
        }

        /*
        return [
            ["type", Type.typeName(this)], 
            ["values", this.map(v => aStore.refValue(v))], 
        ]
        */
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


Object.defineSlots(Array, {
    
    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "Array")
        return aRecord.v.map(v => aStore.unrefValue(v))
    },

    lengthOfRecord: function(aRecord) {
        return aRecord.values.length
    },

})

