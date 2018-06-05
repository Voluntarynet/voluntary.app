"use strict"

window.ideal = {}


class ProtoClass { 
    constructor() {
    }

    static clone() {
        var obj = new this()
        obj.init()
        return obj
    }
    
    init() {
        // subclasses should override to initialize
    }

    type() {
        return this.constructor.name
    }

    static var _uniqueIdCounter = 0;
    static var _allProtos = [Proto];

    // --- slot create and update ---


    newSlot(slotName, initialValue) {
        if (typeof (slotName) != "string") {
            throw new Error("name must be a string");
        }

        if (initialValue === undefined) { 
            initialValue = null 
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

    // --------------------------


    setSlot(name, value) {
        this[name] = value;
        return this;
    }

    setSlots(slots) {
        Object.eachSlot(slots,  (name, initialValue) => {
            this.setSlot(name, initialValue);
        });
        return this;
    }

  

    childProtos() {
        var result = Proto._allProtos.select((proto) => { return proto._parentProto == this })
        console.log("Proto._allProtos = " + Proto._allProtos.map((obj) => { return obj.type() }))
        console.log("'" + this.type() + "'.childProtos() = " + result.map((obj) => { return obj.type() }))

        return result
    }

    extend () {
        var obj = this.cloneWithoutInit()
        Proto._allProtos.push(obj)
        obj._parentProto = this
        //console.log("Proto._allProtos.length = ", Proto._allProtos.length)
        return obj;
    }

    uniqueId () {
        return this._uniqueId
    }

    typeId () {
        return this.type() + this.uniqueId()
    }

    cloneWithoutInit () {
        var obj = Object.clone(this);
        obj.__proto__ = this;
        Proto._uniqueIdCounter ++;
        obj._uniqueId = Proto._uniqueIdCounter;
        //Proto._allProtos.push(obj)
        //console.log("Proto._allProtos.length = ", Proto._allProtos.length)
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

    uniqueId () {
        return this._uniqueId;
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

    newSlot (slotName, initialValue) {
        if (typeof (slotName) != "string") throw "name must be a string";

        if (initialValue === undefined) { initialValue = null };

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

        /*
				this["addTo" + slotName.capitalized()] = function(amount)
				{
					this[privateName] = (this[privateName] || 0) + amount;
					return this;
				}
				*/

        return this;
    }

    updateSlot (slotName, privateName, newValue) {
        var oldValue = this[privateName];
        if (oldValue != newValue) {
            this[privateName] = newValue;
            this.didUpdateSlot(slotName, oldValue, newValue)
            //this.mySlotChanged(name, oldValue, newValue);
        }

        return this;
    }

    didUpdateSlot (slotName, oldValue, newValue) {
        // persistence system can hook this
    }

    mySlotChanged (slotName, oldValue, newValue) {
        this.perform(slotName + "SlotChanged", oldValue, newValue);
    }

    ownsSlot (name) {
        return this.hasOwnProperty(name);
    }

    aliasSlot (slotName, aliasName) {
        this[aliasName] = this[slotName];
        this["set" + aliasName.capitalized()] = this["set" + slotName.capitalized()];
        return this;
    }

    argsAsArray (args) {
        return Array.prototype.slice.call(args);
    }

    newSlots (slots) {
        Object.eachSlot(slots, (slotName, initialValue) => {
            this.newSlot(slotName, initialValue);
        });

        return this;
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

    static var _setterNameMap = {};

    setterNameForSlot (name) {
        // cache these as there aren't too many and it will avoid extra string operations
        var setter = this._setterNameMap[name]
        if (!setter) {
            setter = "set" + name.capitalized()
            this._setterNameMap[name] = setter
        }
        return setter
    }

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

    uniqueId () {
        return this._uniqueId
    }

    isKindOf (aProto) {
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

    ancestors () {
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
        /*
        if (result) { 
            console.log("FOUND " + result.type())
        }
        */
        return result
    }

}

Proto.newSlot("type", "ideal.Proto");


