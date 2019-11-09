"use strict"

Type.typedArrayTypeNames().forEach((name) => {
    window[name].prototype.recordForStore = function(aStore) { // should only be called by Store
        return {
            type: Type.typeName(this), 
            length: this.length,
            values: this.values() // this is an iterator
        }
    }
    
    window[name].instanceFromRecordInStore = function(aRecord, aStore) { // should only be called by Store
        const values = aRecord.values
        const obj = new this(values)
        return obj
    }
})