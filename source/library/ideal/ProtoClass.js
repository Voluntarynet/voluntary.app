"use strict"

/*

    ProtoClass

    Base class to implement some things we're used to in Smalltalk/ObjC,
    as well as Slot related methods.

*/

window.ProtoClass = class ProtoClass extends Object { 

    /*
    static newUniqueInstanceId() {
        const uuid_a = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        const uuid_b = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        return uuid_a + uuid_b
    }
    */

    initPrototype () { 
        // subclasses should call this at end of their definition
    }

    // --- class slots and variables ---
    
    static getClassVariable (key, defaultValue) {
        if (!this.hasOwnProperty(key)) {
            if (Type.isFunction(defaultValue)) { 
                defaultValue = defaultValue()
            }
            this[key] = defaultValue
        }
        return this[key]
    }

    static setClassVariable (key, value) {
        this[key] = value
        return this
    }

    static hasShared () {
        return !Type.isUndefined(this.getClassVariable("_shared"))
    }

    static shared () {
        if (!this.getClassVariable("_shared")) {
            this.setClassVariable("_shared", this.clone())
        }
        return this.getClassVariable("_shared")
    }

    static sharedInstanceForClass(aClass) {
        aClass.shared()
    }

    static allClasses () {
        return this.getClassVariable("_allClasses", [])
    }
    
    static initThisClass () {
        if (this.prototype.hasOwnProperty("initPrototype")) {
            this.prototype.initPrototype.apply(this.prototype)
        }

        /*
        //console.log("initThisClass: ", this)
        if (window.ProtoClass.allClasses().contains(this)) {
            throw new Error("attempt to call initThisClass twice on the same class")
        }

        ProtoClass.allClasses().push(this)
        */

        return this
    }

    static superClass () {
        return Object.getPrototypeOf(this)
    }

    superClass () {
        return this.thisClass().superClass()
    }

    superPrototype () {
        return this.superClass().prototype
    }

    static type() {
        return this.name
    }

    static clone () {
        const obj = new this()
        obj.init()
        return obj
    }

    /*
    static subclassesDescription (level) {
        if (Type.isUndefined(level)) {
            level = 0
        }
        const spacer = "  ".repeat(level)
        const lines = [spacer + this.type()]
        const subclassLines = this.subclasses().map(subclass => spacer + subclass.subclassesDescription(level + 1))
        lines.appendItems(subclassLines)
        return lines.join("\n")
    }
    */

    static isClass () {
        return true
    }

    static isInstance () {
        return false
    }

    static isPrototype () {
        return false
    }

    // --- instance ---

    thisPrototype () {
        assert(this.isInstance())
        const prototype = this.__proto__
        assert(prototype.isPrototype)
        return prototype
    }

    thisClass () {
        if (this.isPrototype()) {
            return this.constructor
        }

        // it's an instance
        return this.__proto__.constructor
    }

    isPrototype () {
        return this.constructor.prototype === this 
    }
    
    isInstance () {
        return !this.isPrototype()
    }

    isClass () {
        return false
    }

    type () {
        return this.constructor.name
    }

    setType (aString) {
        this.constructor.name = aString
        return this
    }

    // --- slots ---

    instanceSlotNamed (slotName) {
        const slots = this.slots()
        if (slots.hasOwnProperty(slotName)) {
            return slots[slotName]
        }
        
        if (this.__proto__ && this.__proto__.slotNamed) {
            return this.__proto__.slotNamed(slotName)
        } else {
            //console.log("is this possible?")
        }

        return null
    }

    slotNamed (slotName) {
        assert(this.isPrototype())
        return this.instanceSlotNamed(slotName)
    }

    // slot objects

    allSlots (allSlots = {}) {
        //assert(this.isPrototype())

        if (this.__proto__ && this.__proto__.slotNamed) {
            this.__proto__.allSlots(allSlots)
        } else {
            //console.log("is this possible?")
        }

        Object.assign(allSlots, this.slots()); // do this last so we override ancestor slots

        return allSlots
    }

    // stored slots

    storedSlots () {

    }

    storedSlotNamesSet () { // returns a set  
        // TODO: use slot cache
        //assert(this.isPrototype())
        const slotsArray = Object.values(this.allSlots())
        return slotsArray.filter(slot => slot.shouldStoreSlot()).map(slot => slot.name()).asSet()
    }

    protoAddStoredSlots (slotNames) {
        assert(this.isPrototype())
        slotNames.forEach(k => this.protoAddStoredSlot(k))
        return this
    }
    
    protoAddStoredSlot (slotName) {
        assert(this.isPrototype())
        this.slotNamed(slotName).setShouldStoreSlot(true)
        // Note: BMStorableNode hooks didUpdateSlot() to call scheduleSyncToStore on updates. 
        return this
    }

    // -------------------------------------

    slots () {
        if (!this.hasOwnProperty("_slots")) {
            Object.defineSlot(this, "_slots", {})
        }
        return this._slots
    }

    newSlot (slotName, initialValue = null) {
        if(!Type.isUndefined(this.allSlots()[slotName])) {
            const msg = this.type() + " newSlot('" + slotName + "') - slot already exists"
            console.log(msg)
            throw new Error(msg)
        }
        return this.justNewSlot(slotName, initialValue)
    }

    overrideSlot (slotName, initialValue = null) {
        const oldSlot = this.allSlots()[slotName]
        if(Type.isUndefined(oldSlot)) {
            const msg = this.type() + " newSlot('" + slotName + "') - no existing slot to override"
            console.log(msg)
            throw new Error(msg)
        }
        const slot = this.justNewSlot(slotName, initialValue)
        slot.copyFrom(oldSlot)
        slot.setInitValue(initialValue)
        slot.setOwner(this)
        return slot
    }

    justNewSlot (slotName, initialValue = null) { // private
        assert(this.isPrototype())
        assert(Type.isString(slotName))

        /*
        // TODO: we want to create the private slots and initial value on instances
        // but ONLY create method slots on classes, not instances...
        const privateName = "_" + slotName
        this[privateName] = initialValue
        */

        const slot = ideal.Slot.clone().setName(slotName).setInitValue(initialValue)
        slot.setOwner(this)
        slot.autoSetGetterSetterOwnership()
        slot.setupInOwner()
        this.slots().atPut(slotName, slot)
        return slot
    }

    newSlots (slots) {
        assert(this.isPrototype())
        if (Object.keys(slots).length === 0) {
            return this
        }
        let s = this.type() + ":\n"
        Object.eachSlot(slots, (slotName, initialValue) => {
            let initialValueString = initialValue
            if (!Type.isLiteral(initialValueString)) {
                initialValueString = "[insert]"
            } else if (Type.isString(initialValueString)) {
                initialValueString = "\"" + initialValueString + "\""
            }
            const line =  "     this.newSlot(\"" + slotName + "\", " + initialValueString + ")\n"
            //console.log(line)
            s += line
            this.newSlot(slotName, initialValue);
        });

        console.log(s)
        return this;
    }

    willGetSlot (aSlot) {
        // example: if the slot name is "subnodes",
        // this will call this.willGetSlotSubnodes()
        const s = aSlot.willGetSlotName()
        const f = this[s]
        if (f) {
            f.apply(this)
        }
    }

    didUpdateSlot (aSlot, oldValue, newValue) {
        /*
        // persistence system can hook this
        const methodName = "didUpdateSlot" + aSlot.name().capitalized()
        if (this[methodName]) {
            this[methodName].apply(this, [oldValue, newValue])
        }
        */
    }

    setSlots (slots) {
        Object.eachSlot(slots, (name, initialValue) => {
            this.setSlot(name, initialValue);
        });
        return this;
    }

    setSlot (name, initialValue) {
        this[name] = initialValue
        return this
    }

    /*
    childProtos () {
        const result = ProtoClass.allClasses().select(proto => proto._parentProto === this )
        return result
    }
    */

    init () { 
        super.init()
        // subclasses should override to do initialization
        //assert(this.isInstance())
        const allSlots = this.__proto__.allSlots()
        allSlots.ownForEachKV((slotName, slot) => slot.onInstanceInitSlot(this)) // TODO: use slot cache
    }

    toString () {
        return this.type();
    }

    ownsSlot (name) {
        return this.hasOwnProperty(name);
    }

    argsAsArray (args) {
        return Array.prototype.slice.call(args);
    }

    respondsTo (methodName) {
        const f = this[methodName] 
        return typeof(f) === "function";
    }

    performWithArgList (message, argList) {
        return this[message].apply(this, argList);
    }

    perform (message) {
        if (this[message] && this[message].apply) {
            return this[message].apply(this, this.argsAsArray(arguments).slice(1));
        }

        throw new Error(this, ".perform(" + message + ") missing method")
        return this;
    }

    setterNameMap () {
        return this.thisClass().getClassVariable("_setterNameMap", {})
    }

    setterNameForSlot (name) {
        // cache these as there aren't too many and it will avoid extra string operations
        let setter = this.setterNameMap()[name]
        if (!setter) {
            setter = "set" + name.capitalized()
            this.setterNameMap()[name] = setter
        }
        return setter
    }

    toString () {
        return this.typeId();
    }

    // --- ancestors ---

    ancestors () { // TODO: test this for ES6 classes
        const results = []
        let obj = this;
        while (obj.__proto__ && obj.type) {
            results.push(obj)
            if (results.length > 100) {
                throw new Error("proto loop detected?")
            }
            obj = obj.__proto__
        }
        return results
    }

    ancestorTypes () {
        return this.ancestors().map(obj => obj.type())
    }

    firstAncestorWithMatchingPostfixClass (aPostfix) {
        // not a great name but this walks back the ancestors and tries to find an
        // existing class with the same name as the ancestor + the given postfix
        // useful for things like type + "View" or type + "RowView", etc
        //this.debugLog(" firstAncestorWithMatchingPostfixClass(" + aPostfix + ")")
        const match = this.ancestors().detect((obj) => {
            const name = obj.type() + aPostfix
            const proto = window[name]
            return proto
        })
        const result = match ? window[match.type() + aPostfix] : null

        return result
    }

    // debugging

    setIsDebugging (aBool) {
        Object.defineSlot(this, "_isDebugging", aBool)
        return this
    }

    isDebugging () {
        return this._isDebugging
    }

    debugLog (s) {
        if (this.isDebugging()) {
            if (Type.isFunction(s)) {
                s = s()
            }
            console.log(" " + s)
        }
        return this
    }

}

window.ProtoClass.initThisClass() // needed as initThisClass looks at window.ProtoClass



