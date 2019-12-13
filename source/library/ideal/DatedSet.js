
"use strict"

/*

    BMStoredDatedSetNode

    A set, with an insertion data attached to each value.
    The set has a maxAgeInSeconds setting (the age at which an enty will be deleted),
    and autoCheckPeriod with is the period at which it checks to see if 
    there are any items to be removed.

    TODO:
    This could be optimized by setting the check period to the soonest expiring item,
    and updating this on any removal or overwrite.
    
*/

window.BMStoredDatedSetNode = class BMStoredDatedSetNode extends BMStorableNode {
    
    initPrototype () {
        const oneHourInSeconds = 60 * 60
        const oneMonthInSeconds = 30 * 24 * 60 * 60

        this.newSlots({
            maxAgeInSeconds: oneMonthInSeconds,
            autoCheckPeriod: oneHourInSeconds,
            dict: null,
        })

        this.protoAddStoredSlot("dict", "autoCheckPeriod", "maxAgeInSeconds")
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setDict({})
        //this.setNoteIsSubnodeCount(true)
        return this
    }
    
    setAutoCheckPeriod (seconds) {
        if (seconds && this._autoCheckPeriod !== seconds) {
            this._autoCheckPeriod = seconds
            this.autoCheck()
        }
    }
    
    autoCheck () {
        this.deleteExpiredKeys()
        setTimeout(() => { this.autoCheck() }, this.autoCheckPeriod()*1000)
    }
    
    didLoadFromStore () {
        super.didLoadFromStore()
        this.deleteExpiredKeys()
    }

    addKey (h) {
        if (!this.dict().at(h)) {
            this.dict().atPut(h, Date.now())
            this.scheduleSyncToStore()
        }
        return this
    }
    
    hasKey (h) {
        return this.dict().hasOwnProperty(h)
    }
    
    removeKey (h) {
        if (this.dict()[h]) {
            delete this.dict()[h]
            this.scheduleSyncToStore()
        }
        return this
    }
    
    ageInSecondsOfKey (h) {
        if (this.hasKey(h)) {
            const ageInSeconds = ( Date.now() - this.dict()[h] ) / 1000
            return ageInSeconds
        }
        
        return null
    }

    expiredKeys () {
        const maxAge = this.maxAgeInSeconds()
        const keys = Object.keys(this.dict())
        return keys.filter(k => this.ageInSecondsOfKey(k) > maxAge)
    }

    deleteExpiredKeys () {
        this.expiredKeys().forEach(k => this.removeKey(k))
        return this
    }
    
}.initThisClass()
