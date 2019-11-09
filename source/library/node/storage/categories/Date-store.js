"use strict"

Date.prototype.recordForStore = function(aStore) { // should only be called by Store
    return {
        type: "Date", 
        v: this.toJSON()
    }
}

Date.instanceFromRecordInStore = function(aRecord, aStore) { // should only be called by Store
    assert(aRecord.type === "Date")
    return new Date(new Date(aRecord.v))
}