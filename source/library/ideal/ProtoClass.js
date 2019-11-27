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

//window.ideal.ProtoClass = 
window.ProtoClass = class ProtoClass { 

    /*
    static newSubclassNamed (subclassName) {
        let s = "window['" + subclassName + "'] = class " + subclassName + " extends " + this.type() + " {}"
        //console.log("s = ", s)
        let subclass = eval(s)
        //window[subclassName] = subclass
        return subclass
    }
    */

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

    /*
    static sharedInstanceForClass() {

    }
    */

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

    static type() {
        return this.name
    }

    static clone () {
        //this.setupSlotsIfNeeded()
        const obj = new this()
        obj.init()
        return obj
    }


    static isInstance () {
        return false
    }

    static isClass () {
        return true
    }

    static slots () {
        const self = this.prototype
        if (!self.hasOwnProperty("_slots")) {
            self._slots = {}
        }
        return self._slots
    }

    static newSlot (slotName, initialValue) {

        assert(Type.isString(slotName))
        assert(Type.isUndefined(this.slots()[slotName]))
        assert(!this.prototype.hasOwnProperty(slotName))

        /*
        // TODO: we want to create the private slots and initial value on instances
        // but ONLY create method slots on classes, not instances...
        const privateName = "_" + slotName
        this[privateName] = initialValue
        */

        const slot = ideal.Slot.clone().setName(slotName).setInitValue(initialValue)
        slot.setOwner(this.prototype)
        slot.setupInOwner()
        this.prototype.slots()[slotName] = slot
        
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

    // --- instance ---

    constructor() {
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
        const slots = this.slots()
        if (slots.hasOwnProperty(slotName)) {
            return slots[slotName]
        }
        
        if (this.__proto__ && this.__proto__.slotNamed) {
            return this.__proto__.slotNamed(slotName)
        }

        return null 
    }

    slots () {
        if (!this.hasOwnProperty("_slots")) {
            this._slots = {}
        }
        return this._slots
    }


    isInstance () {
        return true
    }

    isClass () {
        return false
    }

    newSlot (slotName, initialValue) {
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
        return this
    }

    newSlots (slots) {
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

    /*
    extend () {
        const obj = this.cloneWithoutInit()
        Proto._allProtos.push(obj)
        obj._parentProto = this
        //console.log("Proto._allProtos.length = ", Proto._allProtos.length)
        return obj;
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
        //return ObjectPool.shared()
        return NodeStore.shared()
    }
}

window.ProtoClass.initThisClass()


/*
class EmptyClass {
    YOU_FOUND_ME() {

    }
}
*/

/*
function test() {
    super.test()
}
*/

/*
ProtoClass.newSlots({
    "TEST_SLOT": 1
})

console.log("ProtoClass = ", ProtoClass)
console.log(" --- ")
*/


