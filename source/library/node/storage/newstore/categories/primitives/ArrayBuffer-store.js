"use strict"


Object.defineSlots(ArrayBuffer, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "ArrayBuffer")
        const bytes = aRecord.bytes
        const obj = new ArrayBuffer(bytes.length)
        // loadFromRecord is called from the Store after puuid is set
        return obj
    },
})


Object.defineSlots(ArrayBuffer.prototype, {

    loadFromRecord: function(aRecord, aStore) {
        assert(aRecord.bytes.length === this.length)
        const bytes = aRecord.bytes
        for (let i = 0; i < bytes.length; i++) {
            this[i] = bytes[i]
        }
        return this
    },

    bytes: function() {
        const bytes = []
        for (let i = 0; i < this.byteLength; i++) {
            bytes.push(this[i])
        }
        return bytes
    },

    recordForStore: function(aStore) { // should only be called by Store
        return {
            type: "ArrayBuffer", //Type.typeName(this), 
            bytes: this.bytes(),
        }
    },

    refsPidsForJsonStore: function(puuids = new Set()) {
        return puuids
    },
})



