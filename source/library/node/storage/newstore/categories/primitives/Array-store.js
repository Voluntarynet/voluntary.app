"use strict"

/*
Object.defineSlots(Object.prototype, {

    entriesForStore: function(aStore) {
        return this.recordForStore().entries()
    },

})

Object.defineSlots(Object, {

    instanceFromEntriesInStore: function(entries, aStore) { // should only be called by Store
        return this.instanceFromRecordInStore(Object.fromEntries(entries), aStore)
    },

})
*/


Object.defineSlots(Array.prototype, {

    recordForStore: function(aStore) { // should only be called by Store
        const dict = {
            type: Type.typeName(this), 
            values: this.map(v => aStore.refValue(v))
        }

        return dict
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
        let typeName = aRecord.type
        if (typeName === "Array") {
            typeName = "StorableArray"
        }
        const aClass = window[typeName]
        const newArray = aClass.clone()
        const loadedValues = aRecord.v.map(v => aStore.unrefValue(v))
        loadedValues.forEach( v => newArray.push(v) )
        return newArray
    },

    lengthOfRecord: function(aRecord) {
        return aRecord.values.length
    },

})

