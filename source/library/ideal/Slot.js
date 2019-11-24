"use strict"


/*

    Slot

*/

if (!window.ideal) {
    window.ideal = {}
}

window.ideal.Slot = class Slot { 

    static clone () {
        const obj = new this()
        obj.init()
        return obj
    }

    simpleNewSlot (slotName, initialValue = null) {
        const privateName = "_" + slotName;
        this[privateName] = initialValue;

        if (!this[slotName]) {
            this[slotName] = function () {
                return this[privateName];
            }
        }

        const setterName = "set" + slotName.capitalized()

        if (!this[setterName]) {
            this[setterName] = function (newValue) {
                this[privateName] = newValue;
                return this;
            }
        }
        
        return this;
    }

    init () {
        this.simpleNewSlot("owner", null) // typically a reference to a .prototype
        this.simpleNewSlot("name", false) 
        this.simpleNewSlot("initValue", null) // needed?

        // getter
        this.simpleNewSlot("ownsGetter", true) 
        this.simpleNewSlot("doesHookGetter", false)
        this.simpleNewSlot("hookedGetterIsOneShot", true) 

        // setter
        this.simpleNewSlot("ownsSetter", true) 
        this.simpleNewSlot("doesHookSetter", true) // if shouldStore, then auto post isDirty?
        //this.simpleNewSlot("doesPostSetter", false) // posts a didUpdateSlot<SlotName> note

        // storrage related
        this.simpleNewSlot("isLazy", false) // should hook getter
        this.simpleNewSlot("shouldStore", false) // should hook setter
    }

    setIsLazy (aBool) {
        if (this._isLazy !== aBool) {
            this._isLazy = aBool
            this.onChangedAttribute()
        }
    }

    setShouldStore (aBool) {
        if (this._shouldStore !== aBool) {
            this._shouldStore = aBool
            this.onChangedAttribute()
        }
    }

    onChangedAttribute () {
        if (this.ownsSlot()) {
            this.setupInOwner()
        }
    }

    // setup

    setupInOwner () {
        this.setupValue()
        this.setupGetter()
        this.setupSetter()
        return this
    }

    setupValue () {
        this.owner()[this.privateName()] = this.initValue()
        return this
    }

    // getter

    alreadyHasGetter () {
        return this.owner().hasOwnProperty(this.getterName())
    }

    setupGetter () {
        if (!this.alreadyHasGetter() || this.ownsGetter()) {
            if (this.doesHookGetter()) {
                if (this.hookedGetterIsOneShot()) {
                    this.makeOneShotHookedGetter()
                } else {
                    this.makeHookedGetter()
                }
            } else {
                this.makeDirectGetter()
            }
        }
        return this
    }

    alreadyHasSetter () {
        return this.owner().hasOwnProperty(this.setterName())
    }

    setupSetter () {
        if (!this.alreadyHasSetter() || this.ownsSetter()) {
            if (this.doesHookSetter()) {
                this.makeHookedSetter()
            } else {
                this.makeDirectSetter()
            }
        }
    }

    privateName () {
        return "_" + this.name()
    }

    // --- getter ---

    getterName () {
        return this.name()
    }

    // direct getter

    makeDirectGetter () {
        this.owner()[this.getterName()] = this.directGetter()
        return this
    }

    directGetter () {
        const privateName = this.privateName()
        const func = function () {
            return this[privateName]
        }
        func.setSlot(this)
        return func
    }

    // hooked getter

    makeHookedGetter () {
        this.owner()[this.getterName()] = this.hookedGetter()
        return this
    }

    hookedGetter () {
        const privateName = this.privateName()
        const func = function () {
            this.willGetSlot(privateName) // opportunity to replace value before first access
            return this[privateName]
        }
        func.setSlot(this)
        return func
    }

    // one shot hooked getter

    makeOneShotHookedGetter () {
        this.owner()[this.getterName()] = this.hookedGetter()
        return this
    }

    oneShotHookedGetter () {
        const privateName = this.privateName()
        const func = function () {
            this.willGetSlot(privateName) // opportunity to replace value before first access
            arguments.callee.slot().makeDirectGetter() // now, replace with direct getter after first call
            return this[privateName]
        }
        func.setSlot(this)
        return func
    }

    // --- setter ---

    setterName () {
        return "set" + this.name().capitalized()
    }

    makeDirectSetter () {
        this.owner()[this.setterName()] = this.directSetter()
        return this
    }

    directSetter () {
        const privateName = this.privateName()
        const func = function (newValue) {
            this[privateName] = newValue
            return this
        }
        func.setSlot(this)
        return func
    }

    // hooked setter

    makeHookedSetter () {
        this.owner()[this.setterName()] = this.hookedSetter()
        return this
    }
    
    hookedSetter () {
        const slotName = this.name()
        const privateName = this.privateName()
        const func = function (newValue) {
            const oldValue = this[privateName]
            if (oldValue !== newValue) {
                //this.willSetSlot(slotName, oldValue, newValue)
                this[privateName] = newValue
                //this.didSetSlot(slotName, oldValue, newValue)
                this.didUpdateSlot(slotName, oldValue, newValue)
            }
            return this
        }
        func.setSlot(this)
        return func
    }

    postingSetter () {
        const slotName = this.name()
        const privateName = this.privateName()
        const noteName = "didUpdateSlot" + this.slotName().capitalized()
        const func = function (newValue) {
            const oldValue = this[privateName]
            if (oldValue !== newValue) {
                this[privateName] = newValue
                const didUpdateSlotNote = NotificationCenter.shared().newNote().setSender(this).setName(noteName)
                didUpdateSlotNote.post()
            }
            return this
        }
        func.setSlot(this)
        return func
    }

    /*
    // call helpers

    onInstanceRawGetValue (anInstance) {
        return anInstance[this.privateName()]
    }

    onInstanceGetValue (anInstance) {
        return anInstance[this.getterName()].apply(anInstance)
    }

    onInstanceSetValue (anInstance, aValue) {
        return anInstance[this.setterName()].apply(anInstance, [aValue])
    }
    */

}


Object.defineSlots(Function.prototype, {
    slot: function() {
        return this._slot
    },

    setSlot: function(aSlot) {
        this._slot = aSlot
        return this
    },

    super: function() {
        return this
    },

})