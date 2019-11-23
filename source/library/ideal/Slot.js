"use strict"


/*

    Slot

*/

window.ideal.Slot = class Slot extends ProtoClass { 

    static withName(aName) {
        return Slot.clone().setName(aName)
    }

    init () {
        super.init()
        this.newSlot("owner", null) // a proto
        this.newSlot("name", false) 
        this.newSlot("isLazy", false)
        this.newSlot("shouldStore", false)
        this.newSlot("initValue", null) // needed?
        this.newSlot("hooksGetter", false)
        this.newSlot("hooksSetter", true) // if shouldStore, then auto post isDirty?
    }

    setupInOwner () {
        const owner = this.owner()
        owner[this.privateName()] = this.initValue();

        // getter
        const getterName = this.getterName()
        if (!owner.hasOwnProperty(getterName)) {
            owner[getterName] = this.getter()
        }

        // setter
        const setterName = this.setterName()
        if (!owner.hasOwnProperty(setterName)) {
            owner[setterName] = this.setter()
        }

        return this
    }

    privateName () {
        return "_" + this.name()
    }

    // --- getter ---

    getterName () {
        return this.name()
    }

    getter () {
        if (this.hooksGetter()) {
            this.hookedGetter()
        } 

        return this.directGetter()
    }

    directGetter () {
        const privateName = this.privateName()
        return function () {
            return this[privateName]
        }
    }

    hookedGetter () {
        const privateName = this.privateName()
        return function () {
            this.willGetSlot(privateName)
            return this[privateName]
        }
    }


    // --- setter ---

    setterName () {
        return "set" + this.name().capitalized()
    }

    setter () {
        if (this.hooksSetter()) {
            this.directSetter()
        } 

        return this.hookedSetter()
    }

    directSetter () {
        const slotName = this.name()
        const privateName = this.privateName()
        return function (newValue) {
            this[privateName] = newValue
            return this
        }
    }
    
    hookedSetter () {
        const slotName = this.name()
        const privateName = this.privateName()

        return function (newValue) {
            const oldValue = this[privateName]
            if (oldValue !== newValue) {
                //this.willSetSlot(slotName, oldValue, newValue)
                this[privateName] = newValue
                //this.didSetSlot(slotName, oldValue, newValue)
                this.didUpdateSlot(slotName, oldValue, newValue)
            }
            return this
        }
    }

}
