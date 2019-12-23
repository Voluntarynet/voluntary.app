"use strict"


Object.defineSlots(Array, {
    
    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        let typeName = aRecord.type
        if (typeName !== "SubnodesArray") {
            typeName = "SubnodesArray" // TODO: have setSubnodes do a type conversion? 
        }
        const aClass = window[typeName]
        const obj = aClass.clone()
        //const obj = this.thisClass().clone()
        //obj.loadFromRecord(aRecord, aStore) 
        return obj
    },

    lengthOfRecord: function(aRecord) {
        return aRecord.values.length
    },

})


Object.defineSlots(Array.prototype, {

    recordForStore: function(aStore) { // should only be called by Store
        const dict = {
            type: Type.typeName(this), 
            values: this.map(v => aStore.refValue(v))
        }

        return dict
    },

    loadFromRecord: function(aRecord, aStore) {
        const loadedValues = aRecord.values.map(v => aStore.unrefValue(v))
        loadedValues.forEach( v => this.unhooked_push(v) )
        return this
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


