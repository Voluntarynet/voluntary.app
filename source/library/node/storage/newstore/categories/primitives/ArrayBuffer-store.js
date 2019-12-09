"use strict"


Object.defineSlots(ArrayBuffer.prototype, {

    values: function() {
        const bytes = []
        for (let i = 0; i < this.byteLength; i++) {
            bytes.push(this[i])
        }
        return bytes
    },

    recordForStore: function(aStore) { // should only be called by Store
        byteLength
        return {
            type: "ArrayBuffer", //Type.typeName(this), 
            bytes: this.values(),
        }
    },

    _shouldStore: false, 

    shouldStore: function() {
        return this._shouldStore
    },

    refsPidsForJsonStore: function(puuids = new Set()) {
        return puuids
    },
})

Object.defineSlots(ArrayBuffer, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "ArrayBuffer")
        const bytes = aRecord.bytes
        const newBuffer = new ArrayBuffer(bytes.length)
        for (let i = 0; i < length; i++) {
            newBuffer[i] = bytes[i]
        }
        return newBuffer
    },

})

