"use strict"

Type.typedArrayTypeNames().forEach((name) => {

    Object.defineSlots(window[name].prototype, {
        valuesArray: function() {
            return Array.fromIterator(this.values())
        },

        recordForStore: function(aStore) { // should only be called by Store
            return {
                type: Type.typeName(this), 
                //length: this.length,
                values: this.valuesArray() // this is an iterator
            }
        },

        refsPidsForJsonStore: function(puuids = new Set()) {
            // no references in a TypedArray
            return puuids
        },
    })
    
    Object.defineSlots(window[name], {
        instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
            return new this(aRecord.values)
        },
    })

})