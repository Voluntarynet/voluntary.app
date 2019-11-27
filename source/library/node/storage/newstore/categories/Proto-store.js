"use strict"

Object.defineSlots(ProtoClass.prototype, {

    recordForStore: function(aStore) { // should only be called by Store
        
        const dict = {}

        /*
        Object.getOwnPropertyNames(this).forEach((k) => {
            const v = this[k]
            dict[k] = aStore.refValue(v)
        })
        */

        return {
            type: this.type(), 
            dict: dict, 
        }
    },

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store    
        const proto = window[aRecord.type]
        const obj = proto.clone()
        const dict = aRecord.dict

        /*
        Object.getOwnPropertyNames(dict).forEach((k) => {
            const v = dict[k]
            obj[k] = aStore.unrefValue(v)
        })
        */
        return obj
    },
})