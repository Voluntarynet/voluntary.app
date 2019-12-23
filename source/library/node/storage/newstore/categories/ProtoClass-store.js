"use strict"


Object.defineSlots(ProtoClass, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store    

        throw new Error("unimplemented")

        /*
        const proto = window[aRecord.type]
        const obj = proto.clone()
        const entries = aRecord.entries


        aRecord.entries.forEach((entry) => {
            const k = entry[0]
            const v = entry[1]
            obj[k] = aStore.unrefValue(v)
        })
        
        return obj
        */
    },
})

Object.defineSlots(ProtoClass.prototype, {

    recordForStore: function(aStore) { // should only be called by Store

        throw new Error("unimplemented")

        /*
        const record = {
            type: this.type(), 
            entries: [], 
        }


        Object.keys(this).forEach((k) => {
            const v = this[k]
            const entry = [k, aStore.refValue(v)]
            record.entries.push(entry) 
        })

        return record
        */
    },

})