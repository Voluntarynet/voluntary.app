"use strict"


/*

    Proto

*/

window.ideal = {}

let Proto = new Object;
ideal.Proto = Proto

Proto.setSlot = function (name, value) {
    this[name] = value;
    return this;
};

Proto.setSlots = function (slots) {
    Object.eachSlot(slots,  (name, initialValue) => {
        this.setSlot(name, initialValue);
    });
    return this;
}

Proto.setSlots({
    _uniqueInstanceId: 0,
    
    allProtos: function() {
        if (!Proto._allProtos) {
            Proto._allProtos = []
        }
        return Proto._allProtos
    },

    registerThisProto: function() {
        if (this.allProtos().indexOf(this) === -1) {
            this.allProtos().push(this)
        }
        return this
    },

    _childProtos: [],
    _allDescendantProtos: null,
    
    extend: function () {
        let obj = this.cloneWithoutInit()
        obj.registerThisProto()
        obj._parentProto = this
        obj._childProtos = [] // need to create these slots so they won't be inherited
        this.addChildProto(obj)
        return obj
    },

    addChildProto: function(aProto) {
        this._childProtos.push(aProto)

        /*
        if (this._childProtos.contains(this)) {
            console.log(this.typeId())
            console.log(this._childProtos.map(function(child) { return child.type() }))
            throw "loop!"
        }
        */

        return this
    },

    childProtos: function() {
        return this._childProtos
    },

    allDescendantProtos: function() {
        if (!this._allDescendantProtos) {
            const children = this.childProtos()

            const m = children.map(function (child) { 
                return child.allDescendantProtos() 
            })

            m.push(children)
            let result = m.flatten()
            //return result

            result = result.sort(function (a, b) {
                return a.type().localeCompare(b.type())
            })

            this._allDescendantProtos = result
        }
        return this._allDescendantProtos
    },

    /*
    uniqueId: function () {
        return this._uniqueId
    },
    */

    typeId: function () {
        return this.type() + this.uniqueId()
    },

    /*
    getClassVariable: function(name, defaultValue) {
        if (this[name])

    },
    */

    newUniqueInstanceId: function() {
        Number.isInteger(Proto._uniqueInstanceId)
        Proto._uniqueInstanceId ++
        return Proto._uniqueInstanceId
    },

    setType: function(typeString) {
        this._type = typeString
        this.constructor.name = typeString
        return this
    },

    cloneWithoutInit: function () {
        const obj = Object.clone(this);
        obj.__proto__ = this;
        //obj.constructor.name = this._type // can't assign to an anonymous Function
        obj._uniqueId = this.newUniqueInstanceId()
        obj.assertHasUniqueId()
        // Note: does the JS debugger expect constructor.__proto__.type?
        return obj;
    },

    assertHasUniqueId: function() {
        assert(Number.isInteger(this._uniqueId))
    },

    clone: function () {
        const obj = this.cloneWithoutInit();
        obj.init();
        return obj;
    },

    withSets: function (sets) {
        return this.clone().performSets(sets);
    },

    withSlots: function (slots) {
        return this.clone().setSlots(slots);
    },

    init: function () { 
        // subclasses should override to do initialization
    },

    sharedInstanceForClass: function(aClass) {   
        if (!aClass._shared) {
            aClass._shared = this.clone();
        }
        return aClass._shared;
    },

    /*
    uniqueId: function () {
        return this._uniqueId;
    },
    */

    toString: function () {
        return this._type;
    },

    setSlotsIfAbsent: function (slots) {
        Object.eachSlot(slots,  (name, value) => {
            if (!this[name]) {
                this.setSlot(name, value);
            }
        });
        return this;
    },

    newSlot: function (slotName, initialValue) {
        if (typeof(slotName) !== "string") {
            throw new Error("name must be a string");
        }

        if (initialValue === undefined) { 
            initialValue = null 
        };

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
    },

    updateSlot: function (slotName, privateName, newValue) {
        const oldValue = this[privateName];
        if (oldValue !== newValue) {
            this[privateName] = newValue;
            
            if (privateName === "_type") {
                this.contructor.name = newValue
            }

            this.didUpdateSlot(slotName, oldValue, newValue)
            //this.mySlotChanged(name, oldValue, newValue);
        }

        return this;
    },

    didUpdateSlot: function (slotName, oldValue, newValue) {
        // persistence system can hook this
    },

    mySlotChanged: function (slotName, oldValue, newValue) {
        this.perform(slotName + "SlotChanged", oldValue, newValue);
    },

    ownsSlot: function (name) {
        return this.hasOwnProperty(name);
    },

    aliasSlot: function (slotName, aliasName) {
        this[aliasName] = this[slotName];
        this["set" + aliasName.capitalized()] = this["set" + slotName.capitalized()];
        return this;
    },

    argsAsArray: function (args) {
        return Array.prototype.slice.call(args);
    },

    newSlots: function (slots) {
        Object.eachSlot(slots,  (slotName, initialValue) => {
            this.newSlot(slotName, initialValue);
        });

        return this;
    },

    slotNames: function (obj) {
        return Object.keys(this);
    },

    canPerform: function (message) {
        return this[message] && typeof(this[message]) === "function";
    },

    performWithArgList: function (message, argList) {
        return this[message].apply(this, argList);
    },

    perform: function (message) {
        if (this[message] && this[message].apply) {
            return this[message].apply(this, this.argsAsArray(arguments).slice(1));
        }

        throw new Error(this, ".perform(" + message + ") missing method")

        return this;
    },

    _setterNameMap: {},

    setterNameForSlot: function (name) {
        // cache these as there aren't too many and it will avoid extra string operations
        let setter = this._setterNameMap[name]
        if (!setter) {
            setter = "set" + name.capitalized()
            this._setterNameMap[name] = setter
        }
        return setter
    },

    performSet: function (name, value) {
        return this.perform("set" + name.capitalized(), value);
    },

    performSets: function (slots) {
        Object.eachSlot(slots,  (name, value) => {
            this.perform("set" + name.capitalized(), value);
        });

        return this;
    },

    performGets: function (slots) {
        const object = {};
        slots.forEach( (slot) => {
            object[slot] = this.perform(slot);
        });

        return object;
    },

    uniqueId: function () {
        return this._uniqueId
    },

    isKindOf: function (aProto) {
        if (this.__proto__) {
            if (this.__proto__ === aProto) {
                return true
            }

            if (this.__proto__.isKindOf) {
                return this.__proto__.isKindOf(aProto)
            }
        }
        return false
    },

    toString: function () {
        return this.type() + "." + this.uniqueId();
    },


    // --- ancestors ---

    ancestors: function () {
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
    },

    ancestorTypes: function () {
        return this.ancestors().map(obj => obj.type())
    },

    firstAncestorWithMatchingPostfixClass: function (aPostfix) {
        // not a great name but this walks back the ancestors and tries to find an
        // existing class with the same name as the ancestor + the given postfix
        // useful for things like type + "View" or type + "RowView", etc
        //console.log(this.typeId() + " firstAncestorWithMatchingPostfixClass(" + aPostfix + ")")
        const match = this.ancestors().detect((obj) => {
            const name = obj.type() + aPostfix
            const proto = window[name]
            return proto
        })
        const result = match ? window[match.type() + aPostfix] : null
        /*
        if (result) { 
            console.log("FOUND " + result.type())
        }
        */
        return result
    },

    /*
    Can't use this yet because freeze also make's it's prototype immutable
    Will need to copy whole object and prototype chain before freezing.
    
    asImmutable: function() {
        Object.freeze(this)
    }
    */
});

Proto.newSlot("type", "ideal.Proto");


