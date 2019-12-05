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

    static initThisClass () {
        this.prototype.initPrototype()
        return this
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

        this._slotNames.add(slotName)
        
        return this;
    }

    initPrototype () {
        this._slotNames = new Set()
        
        this.simpleNewSlot("owner", null) // typically a reference to a .prototype
        this.simpleNewSlot("name", false) 
        this.simpleNewSlot("initValue", null) // needed?

        // getter
        this.simpleNewSlot("ownsGetter", true) 
        this.simpleNewSlot("doesHookGetter", false)
        this.simpleNewSlot("hookedGetterIsOneShot", true) 
        this.simpleNewSlot("isInGetterHook", false) 

        // setter
        this.simpleNewSlot("ownsSetter", true) 
        this.simpleNewSlot("doesHookSetter", false) // if shouldStore, then auto post isDirty?
        //this.simpleNewSlot("doesPostSetter", false) // posts a didUpdateSlot<SlotName> note

        // storrage related
        this.simpleNewSlot("isLazy", false) // should hook getter
        this.simpleNewSlot("shouldStore", false) // should hook setter
        this.simpleNewSlot("initProto", null) // clone this proto on init and set to initial value
        //this.simpleNewSlot("shouldShallowCopy", false)
        //this.simpleNewSlot("shouldDeepCopy", false)
        //this.simpleNewSlot("initInstance", null) // clone this instance on init and set to initial value
        this.simpleNewSlot("field", null)
    }

    init () {

    }

    copyFrom (aSlot) {
        this._slotNames.forEach((slotName) => {
            const privateName = "_" + slotName;
            const setterName = "set" + slotName.capitalized()
            const v = aSlot[slotName].apply(aSlot)
            this[setterName].apply(this, [v])
        })
        return this
    }

    autoSetGetterSetterOwnership () {
        //this.setOwnsGetter(true)
        //this.setOwnsSetter(true)
        if (this.alreadyHasGetter()) {
            //console.log(this.owner().type() + "  already has getter " + this.getterName())
        }
        if (this.alreadyHasSetter()) {
            //console.log(this.owner().type() + "  already has setter " + this.setterName())
        }
        this.setOwnsGetter(!this.alreadyHasGetter())
        this.setOwnsSetter(!this.alreadyHasSetter())
        return this
    }

    setDoesHookSetter (aBool) {
        if (this._doesHookSetter !== aBool) {
            this._doesHookSetter = aBool
            if (aBool) { 
                this.setOwnsSetter(true)
            }
            this.setupSetter()
        }
        return this 
    }

    setIsLazy (aBool) {
        if (this._isLazy !== aBool) {
            this._isLazy = aBool
            this.setHookedGetterIsOneShot(aBool) // TODO: make these the same thing?
            this.onChangedAttribute()
        }
        return this
    }

    setShouldStore (aBool) {
        if (this._shouldStore !== aBool) {
            this._shouldStore = aBool
            if (aBool) {
                this.setDoesHookSetter(true) // TODO: is there a better way?
            }
            this.onChangedAttribute()
        }
        return this
    }

    onChangedAttribute () {
        this.setupGetter()
        this.setupSetter()
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
        if (this.ownsGetter()) {
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
        if (this.ownsSetter()) {
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
        //this.owner()[this.getterName()] = this.hookedGetter()
        this.owner()[this.getterName()] = this.safeHookedGetter()
        return this
    }

    hookedGetter () {
        const privateName = this.privateName()
        const slotName = this.name()
        const func = function () {
            this.willGetSlot(slotName) // opportunity to replace value before first access
            return this[privateName]
        }
        func.setSlot(this)
        return func
    }

    safeHookedGetter () {
        const privateName = this.privateName()
        const slotName = this.name()
        // usefull for debugging infinite loops
        const func = function () {
            const slot = arguments.callee.slot()

            if (slot.isInGetterHook()) {
                throw new Error("hooked getter infinite loop detected")
            }

            slot.setIsInGetterHook(true)
            try {
                this.willGetSlot(slotName) 
            } catch(e) {
                slot.setIsInGetterHook(false)
                throw e
            } 
            slot.setIsInGetterHook(false)

            return this[privateName]
        }
        func.setSlot(this)
        return func
    }

    // one shot hooked getter

    makeOneShotHookedGetter () {
        this.owner()[this.getterName()] = this.oneShotHookedGetter()
        return this
    }

    oneShotHookedGetter () {
        const privateName = this.privateName()
        const slotName = this.name()
        const func = function () {
            this.willGetSlot(slotName) // opportunity to replace value before first access
            this.instanceSlotNamed(slotName).makeDirectGetter() // now, replace with direct getter after first call
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
        if (privateName === "_isSelected") {
            console.log("why?")
        }
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

    /*
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
    */

    
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

    refPrivateName () {
        return "_" + this.name() + "Ref"
    }

    onInstanceSetValueRef (anInstance, aRef) {        
        anInstance[this.refPrivateName()] = aRef
        return this
    }

    onInstanceGetValueRef (anInstance, aRef) {        
        return anInstance[this.refPrivateName()]
    }

    onInstanceInitSlot (anInstance) {
        /*
        if (this.initInstance()) {
            const obj = this.initInstance()
            const newObj = obj.prototype.clone().copyFrom(obj)
            this.onInstanceSetValue(anInstance, newObj)
        } else 
        */

        if (this.initProto()) {
            const obj = this.initProto().clone()
            this.onInstanceSetValue(anInstance, obj)
        } else if (this.initValue()) {
            this.onInstanceSetValue(anInstance, this.initValue())
        }

        if (this.field()) {
            // duplicate the field instance owned by the slot,
            // add it as a subnode to the instance,
            // and sync it to the instance's slot value
            const newField = this.field().duplicate()
            anInstance.addSubnode(newField)
            newField.getValueFromTarget()
        }
    }

    onInstanceLoadRef (anInstance) {
        let storeRef = this.onInstanceGetValueRef(anInstance)
        assert(storeRef)
        let obj = storeRef.unref()
        this.onInstanceSetValue(anInstance, obj)
        this.onInstanceSetValueRef(null)
    }

    hasSetterOnInstance (anInstance) {
        return Type.isFunction(anInstance[this.setterName()])
    }
    
}.initThisClass()


// --- slot methods on Function -------------------------------------------------

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