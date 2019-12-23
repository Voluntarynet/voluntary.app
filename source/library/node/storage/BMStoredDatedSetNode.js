
"use strict"

/*

    BMStoredDatedSetNode

*/

window.BMStoredDatedSetNode = class BMStoredDatedSetNode extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("maxAgeInSeconds", 30*24*60*60).setShouldStoreSlot(true)
        this.newSlot("autoCheckPeriod", 1*60*60).setShouldStoreSlot(true)
        this.newSlot("dict", null).setShouldStoreSlot(true)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
    }

    init () {
        super.init()
        this.setDict({})
        //this.setNoteIsSubnodeCount(true)
    }
    
    didUpdateSlotAutoCheckPeriod (seconds) {
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
            this.dict().removeAt(h)
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
