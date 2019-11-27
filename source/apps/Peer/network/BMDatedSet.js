
"use strict"

/*

    BMStoredDatedSetNode

*/

window.BMStoredDatedSetNode = class BMStoredDatedSetNode extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            maxAgeInSeconds: 30*24*60*60,
            autoCheckPeriod: 1*60*60,
            dict: null,
        })
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
		
        this.setDict({})
        this.addStoredSlot("dict", "autoCheckPeriod", "maxAgeInSeconds")

        //this.setNoteIsSubnodeCount(true)
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
        if (!this.dict()[h]) {
            this.dict()[h] = Date.now()
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
            const ageInSeconds = Date.now() - this.dict()[h]
            return ageInSeconds
        }
        
        return null
    }

    deleteExpiredKeys () {
        const max = this.maxAgeInSeconds()
        const keys = Object.keys(this.dict())
        
        keys.forEach((k) => {
            if (this.ageInSecondsOfKey(k) > max) {
                this.removeKey(k)
            }
        })

        return this
    }
    
}.initThisClass()
