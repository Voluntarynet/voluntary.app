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

    static initThisClass () { // can Object handle this now?
        if (this.prototype.hasOwnProperty("initPrototype")) {
            this.prototype.initPrototype.apply(this.prototype)
        }
        return this
    }

    setShouldStore (aBool) {
        throw new Error("Slot.setShouldStore should not be called")
    }

    shouldStore () {
        throw new Error("Slot.shouldStore should not be called")
    }

    simpleNewSlot (slotName, initialValue = null) {
        const privateName = "_" + slotName;
        //this[privateName] = initialValue;
        Object.defineSlot(this, privateName, initialValue)


        if (!this[slotName]) {
            const simpleGetter = function () {
                return this[privateName];
            }

            Object.defineSlot(this, slotName, simpleGetter)
        }

        const setterName = "set" + slotName.capitalized()

        if (!this[setterName]) {
            const simpleSetter = function (newValue) {
                this[privateName] = newValue;
                return this;
            }

            Object.defineSlot(this, setterName, simpleSetter)
        }

        this._slotNames.add(slotName)
        
        return this;
    }

    initPrototype () {
        Object.defineSlot(this, "_slotNames", new Set())

        //this._slotNames = new Set()
        
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
        this.simpleNewSlot("shouldStoreSlot", false) // should hook setter
        this.simpleNewSlot("initProto", null) // clone this proto on init and set to initial value
        this.simpleNewSlot("valueClass", null) // declare the value should be a kind of valueClass
        //this.simpleNewSlot("shouldShallowCopy", false)
        //this.simpleNewSlot("shouldDeepCopy", false)
        //this.simpleNewSlot("initInstance", null) // clone this instance on init and set to initial value
        this.simpleNewSlot("field", null)

        // slot hook names
        this.simpleNewSlot("willGetSlotName", null)
        //this.simpleNewSlot("willUpdateSlotName", null)
        //this.simpleNewSlot("didUpdateSlotName", null)

        this.simpleNewSlot("duplicateOp", "nop")
        this.simpleNewSlot("validDuplicateOps", new Set(["nop", "copyValue", "duplicate"])) 
        this.simpleNewSlot("comment", null)
        this.simpleNewSlot("isPrivate", false)
    }

    init () {

    }

    validDuplicateOps () {
        return new Set(["nop", "copyValue", "duplicate"])
    }

    setDuplicateOp (aString) {
        assert(this.validDuplicateOps().has(aString))
        this._duplicateOp = aString
        return this
    }

    setName (aName) {
        this._name = aName
        this.didUpdateSlotName()
        return this
    }

    didUpdateSlotName () {
        const capName = this.name().capitalized()
        this.setWillGetSlotName("willGetSlot" + capName)
        /*
        this.setDidUpdateSlotName("didUpdateSlot" + capName)
        this.setWillUpdateSlotName("willUpdateSlot" + capName)
        */
        return this
    }

    copyFrom (aSlot) {
        this._slotNames.forEach((slotName) => {
            const privateName = "_" + slotName;
            this[privateName] = aSlot[privateName]
            /*
            const setterName = "set" + slotName.capitalized()
            const v = aSlot[slotName].apply(aSlot)
            this[setterName].apply(this, [v])
            */
        })
        return this
    }

    autoSetGetterSetterOwnership () {
        //this.setOwnsGetter(true)
        //this.setOwnsSetter(true)
        
        if (this.alreadyHasGetter()) {
            //console.log(this.owner().type() + "." + this.getterName() + "() exists, so we won't override")
        }
        
        if (this.alreadyHasSetter()) {
            //console.log(this.owner().type() + "." + this.setterName() + "(v) exists, so we won't override")
        }

        this.setOwnsGetter(!this.alreadyHasGetter())
        this.setOwnsSetter(!this.alreadyHasSetter())
        return this
    }

    setDoesHookSetter (aBool) {
        if (this._doesHookSetter !== aBool) {
            this._doesHookSetter = aBool
            if (aBool) {
                if (this.alreadyHasSetter() && !this.ownsSetter()) {
                    const msg = this.owner().type() + "." + this.setterName() + "() exists, so we can't hook it - fix by calling slot.setOwnsSetter(true)"
                    console.log(msg)
                    throw new Error(msg)
                } 
                // this.setOwnsSetter(true)
            }
            this.setupSetter()
        }
        return this 
    }

    setIsLazy (aBool) {
        if (this._isLazy !== aBool) {
            this._isLazy = aBool
            this.setHookedGetterIsOneShot(aBool) // TODO: make these the same thing?
            //this.onChangedAttribute()
        }
        return this
    }

    setShouldStoreSlot (aBool) {
        if (this.name() === "subnodeProto") {
            console.log("---")
        }
        if (this._shouldStoreSlot !== aBool) {
            this._shouldStoreSlot = aBool
            if (aBool) {
                this.setDoesHookSetter(true) // TODO: is there a better way?
            } else {
                this.setIsLazy(false)
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
        Object.defineSlot(this.owner(), this.privateName(), this.initValue())
        //this.owner()[this.privateName()] = this.initValue()
        return this
    }

    // getter

    alreadyHasGetter () {
        return this.owner().hasOwnProperty(this.getterName())
    }

    setupGetter () {
        if (this.ownsGetter()) {
            if (this.doesHookGetter()) {
                if (this.isLazy()) {
                    this.makeLazyGetter()
                } else if (this.hookedGetterIsOneShot()) {
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

            this.makeHookedSetter()

            /*
            if (this.doesHookSetter()) {
                this.makeHookedSetter()
            } else {
                this.makeDirectSetter()
            }
            */
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
        Object.defineSlot(this.owner(), this.getterName(), this.directGetter())
        //this.owner()[this.getterName()] = this.directGetter()
        return this
    }

    directGetter () {
        const privateName = this.privateName()
        const func = function () {
            return this[privateName]
        }
        //func.setSlot(this)
        return func
    }

    // hooked getter

    makeHookedGetter () {
        //this.owner()[this.getterName()] = this.hookedGetter()
        Object.defineSlot(this.owner(), this.getterName(), this.safeHookedGetter())
        return this
    }


    makeLazyGetter () {
        //this.owner()[this.getterName()] = this.hookedGetter()
        Object.defineSlot(this.owner(), this.getterName(), this.lazyGetter())
        return this
    }

    makeDirectGetterOnInstance (anInstance) {
        //anInstance[this.getterName()] = this.directGetter()
        Object.defineSlot(anInstance, this.getterName(), this.directGetter())
        return this   
    }

    hookedGetter () {
        const privateName = this.privateName()
        const slotName = this.name()
        const slot = this
        const func = function () {
            this.willGetSlot(slot) // opportunity to replace value before first access
            return this[privateName]
        }
        //func.setSlot(this)
        return func
    }

    safeHookedGetter () {
        const privateName = this.privateName()
        const slotName = this.name()
        // usefull for debugging infinite loops
        const slot = this
        const func = function () {

            if (slot.isInGetterHook()) { 
                throw new Error("hooked getter infinite loop detected")
            }

            slot.setIsInGetterHook(true)
            try {
                this.willGetSlot(slot) 
            } catch(e) {
                slot.setIsInGetterHook(false)
                throw e
            } 
            slot.setIsInGetterHook(false)

            return this[privateName]
        }
        //func.setSlot(this)
        return func
    }

    // one shot hooked getter

    makeOneShotHookedGetter () {
        assert(this.owner().isPrototype())
        console.log(this.owner().type() + "." + this.name() + " setting up one-shot getter in prototype")
        //this.owner()[this.getterName()] = this.oneShotHookedGetter()
        Object.defineSlot(this.owner(), this.getterName(), this.oneShotHookedGetter())
        return this
    }

    oneShotHookedGetter () {
        const privateName = this.privateName()
        const slotName = this.name()
        const slot = this
        const willGetSlotName = this.willGetSlotName()
        const func = function () {
            console.log(this.typeId() + "." + slot.name() + " replacing one-shot getter with direct getter")
            slot.makeDirectGetterOnInstance(this) // now, replace with direct getter after first call
            //this.willGetSlot(slot) // opportunity to replace value before first access
            if (this[willGetSlotName]) {
                this[willGetSlotName].apply(this)
            }
            return this[privateName]
        }
        //func.setSlot(this)
        return func
    }

    lazyGetter () {
        const slot = this
        const privateName = this.privateName()
        const slotName = this.name()
        const willGetSlotName = this.willGetSlotName()
        const func = function () {
            //console.log(this.typeId() + "." + slot.name() + " lazySlotGetter")
            
            slot.makeDirectGetterOnInstance(this) // now, replace with direct getter after first call
            
            slot.onInstanceLoadRef(this)

            if (this[willGetSlotName]) {
                this[willGetSlotName].apply(this)
            }

            return this[privateName]
        }
        //func.setSlot(this)
        return func
    }

    // --- setter ---

    setterName () {
        return "set" + this.name().capitalized()
    }

    makeDirectSetter () {
        //this.owner()[this.setterName()] = this.directSetter()
        Object.defineSlot(this.owner(), this.setterName(), this.directSetter())
        return this
    }

    directSetter () {
        const privateName = this.privateName()
        const slot = this
        const setterName = this.setterName()
        //const superProto = this.owner().superPrototype()
        const func = function (newValue) {
            /*
            // this is dangerous - we don't always want this behavior
            if (superProto && superProto[setterName]) {
                superProto[setterName].apply(this, [newValue])
            }
            */

            this[privateName] = newValue

            /*
            if (this[privateName] !== newValue) {
                this[privateName] = newValue
            }
            */
            return this
        }
        //func.setSlot(this)
        return func
    }

    // hooked setter

    makeHookedSetter () {
        //this.owner()[this.setterName()] = this.hookedSetter()
        Object.defineSlot(this.owner(), this.setterName(), this.hookedSetter())
        return this
    }

    /*
    updateWithHookOnInstance (anInstance) {
        const slotName = this.name()
        const privateName = this.privateName()
        const didUpdateSlotMethodName = "didUpdateSlot" + slotName.capitalized()
        const oldValue = this[privateName]

        this[privateName] = newValue
        this.didUpdateSlot(slot, oldValue, newValue)
        if (this[didUpdateSlotMethodName]) {
            this[didUpdateSlotMethodName].apply(this, [oldValue, newValue])
        }
    }
    */
    
    hookedSetter () {
        const slot = this
        const slotName = this.name()
        const privateName = this.privateName()
        const didUpdateSlotMethodName = "didUpdateSlot" + slotName.capitalized()
        const func = function (newValue) {
            const oldValue = this[privateName]
            if (oldValue !== newValue) {
                
                this[privateName] = newValue
                this.didUpdateSlot(slot, oldValue, newValue)

                if (this[didUpdateSlotMethodName]) {
                    this[didUpdateSlotMethodName].apply(this, [oldValue, newValue])
                }

            }
            return this
        }
        //func.setSlot(this)
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
        //func.setSlot(this)
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

    // --- StoreRefs for lazy slots ---

    refPrivateName () {
        return "_" + this.name() + "Ref"
    }

    onInstanceSetValueRef (anInstance, aRef) {        
        Object.defineSlot(anInstance, this.refPrivateName(), aRef)
        return this
    }

    onInstanceGetValueRef (anInstance, aRef) {        
        return anInstance[this.refPrivateName()]
    }

    // -----------------------------------------------------

    onInstanceInitSlot (anInstance) {
        /*
        if (this.initInstance()) {
            const obj = this.initInstance()
            const newObj = obj.prototype.clone().copyFrom(obj)
            this.onInstanceSetValue(anInstance, newObj)
        } else 
        */

        // to ensure privateName isn't enumerable
        Object.defineSlot(anInstance, this.privateName(), anInstance[this.privateName()])

        if (this.isLazy()) {
            const obj = this.initProto().clone()
            anInstance[this.privateName()] = obj
        } else if (this.initProto()) {
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
        const storeRef = this.onInstanceGetValueRef(anInstance)
        if (storeRef) {
            
            //console.warn(anInstance.typeId() + "." + this.name() + " [" + anInstance.title() + "] - loading storeRef")
            //console.warn(anInstance.title() + " loading storeRef for " + this.name())
            const obj = storeRef.unref()
            /*
            //console.warn("   loaded: " + obj.type())
            anInstance[this.privateName()] = obj // is this safe? what about initialization?
            //this.onInstanceSetValue(anInstance, obj)
            this.onInstanceSetValueRef(anInstance, null)
            */

            const setter = anInstance[this.setterName()]
            setter.apply(anInstance, [obj])

        } else {
            //console.warn(anInstance.typeId() + " unable to load storeRef - not found")
            //console.warn(anInstance.typeId() + ".shouldStoreSubnodes() = " + anInstance.shouldStoreSubnodes())
            //throw new Error("")
        }
    }

    hasSetterOnInstance (anInstance) {
        return Type.isFunction(anInstance[this.setterName()])
    }

    // --- should store on instance ---

    shouldStoreSlotOnInstancePrivateName() {
        return "_shouldStoreSlot" + this.name().capitalized()
    }

    shouldStoreSlotOnInstance (anInstance) {
        const k = this.shouldStoreSlotOnInstancePrivateName()
        const v = anInstance[k]
        if (Type.isUndefined(v)) {
            return this.shouldStoreSlot()
        }
        return v === true
    }

    setShouldStoreSlotOnInstance (anInstance, aBool) {
        const k = this.shouldStoreSlotOnInstancePrivateName()
        Object.defineSlot(anInstance, k, aBool)
        return aBool
    }
    
}.initThisClass()


// --- slot methods on Function -------------------------------------------------

/*
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
*/