"use strict"

/*
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

class ProtoClass { 

    // --- class slots and variables ---
    
    static getClassVariable(key, defaultValue) {
        if (!(key in this)) {
            this[key] = defaultValue
        }
        return this[key]
    }

    static setClassVariable(key, value) {
        this[key] = value
        return this
    }

    static shared() {
        if (!this.getClassVariable("_shared")) {
            this.setClassVariable("_shared", this.clone())
        }
        return this.getClassVariable("_shared")
    }

    static allClasses () {
        return this.getClassVariable("_allClasses", [])
    }
    
    static registerThisClass () {
        //console.log("registerThisClass: ", this)
        if (this.allClasses().indexOf(this) == -1) {
            this.allClasses().push(this)
        }
        return this
    }

    static self () {
        return this
    }

    self () {
        return this
    }

    /*
    static setupSlots () {
        //super.setupSlotsIfNeeded()
        console.log(this.type() + ".setupSlots()")
    }

    static setupSlotsIfNeeded () {
        if (!this.getClassVariable("_hasSetupSlots", false)) {
            console.log("--- begin ---")
            this.setupSlots()
            if (this.type() != "ProtoClass") {
                super.setupSlotsIfNeeded()
            }
            console.log("--- end ---")
            this.setClassVariable("_hasSetupSlots", true)
        }
    }
    */

    // adding instance slots via class ---

    static newSlots(slots) {
        this.prototype.newSlots(slots)
        return this;
    }

    static setSlots(slots) {
        this.prototype.setSlots(slots)
        return this;
    }


    // --- instance ---

    constructor() {
    }

    static clone () {
        //this.setupSlotsIfNeeded()
        var obj = new this()
        obj.assignUniqueId()
        obj.init()
        return obj
    }
    
    init() {
        // subclasses should override to initialize
    }

    static type() {
        return this.name
    }

    type() {
        return this.constructor.name
    }

    newSlot(slotName, initialValue) {
        if (typeof (slotName) != "string") {
            throw new Error("name must be a string");
        }

        if (initialValue === undefined) { 
            initialValue = null; 
        };

        var privateName = "_" + slotName;
        this[privateName] = initialValue;

        if (!this[slotName]) {
            this[slotName] = function () {
                return this[privateName];
            }
        }

        var setterName = "set" + slotName.capitalized()

        if (!this[setterName]) {
            this[setterName] = function (newValue) {
                //this[privateName] = newValue;
                this.updateSlot(slotName, privateName, newValue);
                return this;
            }
        }

        return this;
    }

    newSlots(slots) {
        Object.eachSlot(slots,  (slotName, initialValue) => {
            this.newSlot(slotName, initialValue);
        });

        return this;
    }

    updateSlot(slotName, privateName, newValue) {
        var oldValue = this[privateName];
        if (oldValue != newValue) {
            this[privateName] = newValue;
            this.didUpdateSlot(slotName, oldValue, newValue)
            //this.mySlotChanged(name, oldValue, newValue);
        }

        return this;
    }

    didUpdateSlot(slotName, oldValue, newValue) {
        // persistence system can hook this
    }

    setSlots(slots) {
        Object.eachSlot(slots,  (name, initialValue) => {
            this.setSlot(name, initialValue);
        });
        return this;
    }

    setSlot(name, initialValue) {
        this[name] = initialValue
        return this
    }


    childProtos () {
        var result = ProtoClass.allClasses().select((proto) => { return proto._parentProto == this })
        return result
    }

    /*
    allDescendantProtos () {

    }
    */

    /*
    extend () {
        var obj = this.cloneWithoutInit()
        Proto._allProtos.push(obj)
        obj._parentProto = this
        //console.log("Proto._allProtos.length = ", Proto._allProtos.length)
        return obj;
    }
    */

    uniqueId () {
        return this._uniqueId
    }

    typeId () {
        return this.type() + this.uniqueId()
    }

    hasUniqueId () {
        return Number.isInteger(this._uniqueId)
    }

    assertHasUniqueId () {
        assert(this.hasUniqueId())
    }

    assignUniqueId () {
        assert(!this.hasUniqueId()) // error may mean attempt to clone a singleton
        this._uniqueId = ProtoClass.newUniqueId();
        this.assertHasUniqueId()
        return this
    }

    cloneWithoutInit () {
        var obj = Object.clone(this);
        obj.__proto__ = this;
        obj.assignUniqueId();
        return obj;
    }

    clone () {
        var obj = this.cloneWithoutInit();
        obj.init();
        return obj;
    }

    withSets (sets) {
        return this.clone().performSets(sets);
    }

    withSlots (slots) {
        return this.clone().setSlots(slots);
    }

    init () { 
        // subclasses should override to do initialization
    }

    toString () {
        return this._type;
    }

    setSlotsIfAbsent (slots) {
        Object.eachSlot(slots,  (name, value) => {
            if (!this[name]) {
                this.setSlot(name, value);
            }
        });
        return this;
    }

    /*

    mySlotChanged (slotName, oldValue, newValue) {
        this.perform(slotName + "SlotChanged", oldValue, newValue);
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
        return this[message] && typeof (this[message]) == "function";
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
        var setter = this.setterNameMap()[name]
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
        var object = {};
        slots.forEach( (slot) => {
            object[slot] = this.perform(slot);
        });

        return object;
    }
    */

    static newUniqueId() {
        var key = "_uniqueIdCounter"
        var uid = this.getClassVariable(key, 0)
        uid ++;
        this.setClassVariable(key, uid)
        return uid
    }

    uniqueId () {
        return this._uniqueId
    }

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
        return this.type() + "." + this.uniqueId();
    }


    // --- ancestors ---

    ancestors () { // TODO: test this for ES6 classes
        var results = []
        var obj = this;
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
        return this.ancestors().map((obj) => { return obj.type() })
    }

    firstAncestorWithMatchingPostfixClass (aPostfix) {
        // not a great name but this walks back the ancestors and tries to find an
        // existing class with the same name as the ancestor + the given postfix
        // useful for things like type + "View" or type + "RowView", etc
        //console.log(this.type() + " firstAncestorWithMatchingPostfixClass(" + aPostfix + ")")
        var match = this.ancestors().detect((obj) => {
            var name = obj.type() + aPostfix
            var proto = window[name]
            return proto
        })
        var result = match ? window[match.type() + aPostfix] : null

        return result
    }
}

