"use strict"

Object.prototype.recordForStore = function(aStore) { // should only be called by Store
    const dict = {}

    Object.getOwnPropertyNames(this).forEach((k) => {
        const v = this[k]
        dict[k] = aStore.refValue(v)
    })

    return {
        type: "Object", 
        dict: dict, 
    }
}

Object.instanceFromRecordInStore = function(aRecord, aStore) { // should only be called by Store
    assert(aRecord.type === "Object")
    
    const obj = {}
    const dict = aRecord.dict

    Object.getOwnPropertyNames(dict).forEach((k) => {
        const v = dict[k]
        obj[k] = aStore.unrefValue(v)
    })
    return obj
}