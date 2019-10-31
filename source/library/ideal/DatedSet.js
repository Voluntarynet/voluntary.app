
"use strict"

/*

    BMStoredDatedSetNode

*/

BMStorableNode.newSubclassNamed("BMStoredDatedSetNode").newSlots({
    maxAgeInSeconds: 30*24*60*60,
    autoCheckPeriod: 1*60*60,
    dict: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
		
        this.setDict({})
        this.addStoredSlot("dict", "autoCheckPeriod", "maxAgeInSeconds")

        //this.setNoteIsSubnodeCount(true)
        return this
    }.setDoc("init", "initialize the object", "returns this"),
    
    setAutoCheckPeriod: function(seconds) {
        if (seconds && this._autoCheckPeriod !== seconds) {
            this._autoCheckPeriod = seconds
            this.autoCheck()
        }
    },
    
    autoCheck: function() {
        this.deleteExpiredKeys()
        setTimeout(() => { this.autoCheck() }, this.autoCheckPeriod()*1000)
    },
    
    didLoadFromStore: function() {
        BMStorableNode.didLoadFromStore.apply(this)
        this.deleteExpiredKeys()
    },

    addKey: function(h) {
        if (!this.dict()[h]) {
            this.dict()[h] = Date.now()
            this.scheduleSyncToStore()
        }
        return this
    },
    
    hasKey: function(h) {
        return h in this.dict()
    },
    
    removeKey: function(h) {
        if (this.dict()[h]) {
            delete this.dict()[h]
            this.scheduleSyncToStore()
        }
        return this
    },
    
    ageInSecondsOfKey: function(h) {
        if (this.hasKey(h)) {
            const ageInSeconds = Date.now() - this.dict()[h]
            return ageInSeconds
        }
        
        return null
    },

    deleteExpiredKeys: function() {
        const max = this.maxAgeInSeconds()
        const keys = Object.keys(this.dict())
        
        keys.forEach((k) => {
            if (this.ageInSecondsOfKey(k) > max) {
                this.removeKey(k)
            }
        })

        return this
    },
})
