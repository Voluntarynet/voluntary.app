"use strict"

/*

    ProtoClass
    
    working on moving Proto to ES6 classes

    problems and potential solutions:

    P: getting list of classes?
    S: call registerClass() on each class after defined, use ProtoClass.allClasses() to get list

    P: inheriting proto ivars?
    S: Use class variables instead?

    P: protos as singletons?
    S: Yse ClassName.shared() instead

    P: interactively adding, removing, changing protos?
    S: ?

*/

window.ProtoClass = class ProtoClass { 

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
            if (Type.isFunction()) { 
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
        this.prototype.initPrototype()

        //console.log("initThisClass: ", this)
        if (window.ProtoClass.allClasses().contains(this)) {
            throw new Error("attempt to call initThisClass twice on the same class")
        }

        ProtoClass.allClasses().push(this)

        return this
    }

    static superClass () {
        return Object.getPrototypeOf(this)
    }

    /*
    static newSlots (slots) {
        throw new Error("should all on prototype instead")
        this.prototype.newSlots(slots)
        return this;
    }

    static setSlots (slots) {
        throw new Error("should all on prototype instead")
        this.prototype.setSlots(slots)
        return this;
    }
    */

    static type() {
        return this.name
    }

    static clone () {
        const obj = new this()
        obj.init()
        return obj
    }

    static slots () {
        throw new Error("use proto version?")
        /*
        const self = this.prototype
        if (!self.hasOwnProperty("_slots")) {
            self._slots = {}
        }
        return self._slots
        */
    }

    static newSlot (slotName, initialValue) {
        throw new Error("use proto version?")
        /*
        assert(Type.isString(slotName))
        assert(Type.isUndefined(this.slots()[slotName]))
        assert(!this.prototype.hasOwnProperty(slotName))
        */

        /*
        // TODO: we want to create the private slots and initial value on instances
        // but ONLY create method slots on classes, not instances...
        const privateName = "_" + slotName
        this[privateName] = initialValue
        */

        /*
        const slot = ideal.Slot.clone().setName(slotName).setInitValue(initialValue)
        slot.setOwner(this.prototype)
        slot.setupInOwner()
        this.prototype.slots()[slotName] = slot
        */
        return this;
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
        let prototype = this.__proto__
        assert(prototype.isPrototype)
        return prototype
    }

    thisClass () {
        if (this.isPrototype()) {
            return this.constructor
        }
        return this.__proto___.constructor
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

    constructor() {
        //console.log("constructed!")
    }
    
    init () {
        // subclasses should override to initialize
    }

    type () {
        return this.constructor.name
    }

    setType (aString) {
        this.constructor.name = aString
        return this
    }

    // --- slots ---


    slotNamed (slotName) {
        assert(this.isPrototype())
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

    // slot objects

    allSlots (allSlots = {}) {
        assert(this.isPrototype())
        Object.assign(allSlots, this.slots());

        if (this.__proto__ && this.__proto__.slotNamed) {
            this.__proto__.allSlots(allSlots)
        } else {
            //console.log("is this possible?")
        }

        return allSlots
    }

    // shallow copy slots

    /*
    addShallowCopySlotNames (names) {
        names.forEach(name => this.slotNamed(name).setShouldShallowCopy(true))
        return this
    }

    shallowCopySlotnames () {
        return this.allSlots().filter(slot => slot.shouldShallowCopy()).map(slot => slot.name()).asSet()
    }
    */

    // deep copy slots

    /*
    addDeepCopySlotNames (names) {
        names.forEach(name => this.slotNamed(name).setShouldDeepCopy(true))
        return this
    }

    deepCopySlotnames () {
        return this.allSlots().filter(slot => slot.shouldDeepCopy()).map(slot => slot.name()).asSet()
    }
    */

    // stored slots

    storedSlotNames () { // returns a set  
        // TODO: use slot cache
        assert(this.isPrototype())
        return this.allSlots().filter(slot => slot.shouldStore()).map(slot => slot.name()).asSet()
    }

    protoAddStoredSlots (slotNames) {
        assert(this.isPrototype())
        slotNames.forEach(k => this.protoAddStoredSlot(k))
        return this
    }
    
    protoAddStoredSlot (slotName) {
        assert(this.isPrototype())
        this.slotNamed(slotName).setDoesHookSetter(true).setShouldStore(true)
        //this.slotNamed(slotName).setDoesHookSetter(true).setShouldStore(true)
        // Note: BMStorableNode hooks didUpdateSlot() to call scheduleSyncToStore on updates. 
        return this
    }
    
    protoRemoveStoredSlot (slotName) {
        assert(this.isPrototype())
        this.slotNamed(slotName).setDoesHookSetter(false).setShouldStore(false)
        return this
    }

    // -------------------------------------

    slots () {
        if (!this.hasOwnProperty("_slots")) {
            this._slots = {}
        }
        return this._slots
    }

    newSlot (slotName, initialValue = null) {
        assert(this.isPrototype())
        /*
        if (slotName === "overView") {
            console.log("overView")
        }
        */
        
        assert(Type.isString(slotName))
        assert(Type.isUndefined(this.slots()[slotName]))
        //assert(!this.hasOwnProperty(slotName))

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
        this.slots()[slotName] = slot
        return slot
    }

    newSlots (slots) {
        assert(this.isPrototype())
        Object.eachSlot(slots, (slotName, initialValue) => {
            this.newSlot(slotName, initialValue);
        });

        return this;
    }

    updateSlot (slotName, privateName, newValue) {
        const oldValue = this[privateName];
        if (oldValue !== newValue) {
            this[privateName] = newValue;
            this.didUpdateSlot(slotName, oldValue, newValue)
        }

        return this;
    }

    didUpdateSlot (slotName, oldValue, newValue) {
        // persistence system can hook this
    }

    setSlots (slots) {
        Object.eachSlot(slots,  (name, initialValue) => {
            this.setSlot(name, initialValue);
        });
        return this;
    }

    setSlot (name, initialValue) {
        this[name] = initialValue
        return this
    }


    childProtos () {
        const result = ProtoClass.allClasses().select((proto) => { return proto._parentProto === this })
        return result
    }

    /*
    allDescendantProtos () {

    }
    */

    typeId () {
        return this.typePuuid()
    }

    cloneWithoutInit () {
        const obj = Object.clone(this);
        obj.__proto__ = this;
        return obj;
    }

    clone () {
        const obj = this.cloneWithoutInit();
        obj.init();
        return obj;
    }

    /*
    withSets (sets) {
        return this.clone().performSets(sets);
    }

    withSlots (slots) {
        return this.clone().setSlots(slots);
    }
    */

    init () { 
        // subclasses should override to do initialization
        assert(this.isInstance())
        let allSlots = this.__proto__.allSlots()
        allSlots.ownForEachKV((slotName, slot) => { slot.onInstanceInitSlot(this) }) // TODO: use slot cache
    }

    toString () {
        return this.type();
    }

    /*
    setSlotsIfAbsent (slots) {
        Object.eachSlot(slots,  (name, value) => {
            if (!this[name]) {
                this.setSlot(name, value);
            }
        });
        return this;
    }
    */

    ownsSlot (name) {
        return this.hasOwnProperty(name);
    }

    /*
    aliasSlot (slotName, aliasName) {
        this[aliasName] = this[slotName];
        this["set" + aliasName.capitalized()] = this["set" + slotName.capitalized()];
        return this;
    }
    */

    argsAsArray (args) {
        return Array.prototype.slice.call(args);
    }

    canPerform (message) {
        return this[message] && typeof(this[message]) === "function";
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
        return this.getClassVariable("_setterNameMap", {})
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

    /*
    performSet (name, value) {
        return this.perform("set" + name.capitalized(), value);
    }

    performSets (slots) {
        Object.eachSlot(slots, (name, value) => {
            this.perform("set" + name.capitalized(), value);
        });

        return this;
    }

    performGets (slots) {
        let object = {};
        slots.forEach( (slot) => {
            object[slot] = this.perform(slot);
        });

        return object;
    }
    */


    isKindOf (aProto) { // TODO: test this for ES6 classes
        if (this.__proto__) {
            if (this.__proto__ === aProto) {
                return true
            }

            if (this.__proto__.isKindOf) {
                return this.__proto__.isKindOf(aProto)
            }
        }
        return false
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
        this._isDebugging = aBool
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

    defaultStore () {
        return PersistentObjectPool.shared()
        //return ObjectPool.shared()
    }
}

window.ProtoClass.initThisClass() // needed as initThisClass looks at window.ProtoClass



