"use strict"


Object.defineSlots(ArrayBuffer.prototype, {

    values: function() {
        const values = []
        for (let i = 0; i < this.byteLength; i++) {
            values.push(this[i])
        }
        return values
    },

    recordForStore: function(aStore) { // should only be called by Store
        byteLength
        return {
            type: "ArrayBuffer", //Type.typeName(this), 
            byteLength: this.byteLength,
            values: this.values(),
        }
    },

    shouldStore: function() {
        return true
    },

    refsPidsForJsonStore: function(puuids = new Set()) {
        return puuids
    },
})

Object.defineSlots(ArrayBuffer, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "ArrayBuffer")
        const length = aRecord.byteLength
        const values = aRecord.values
        const newBuffer = new ArrayBuffer(aRecord.length)
        for (let i = 0; i < length; i++) {
            newBuffer[i] = values[i]
        }
        return newBuffer
    },

})

