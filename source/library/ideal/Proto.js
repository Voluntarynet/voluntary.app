"use strict"

/*

    Proto

*/

if (!window.ideal) {
    window.ideal = {}
}

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
    allProtos: function() {
        //return this.getClassVariable("_allProtos", [])
        if (!Proto._allProtos) {
            Proto._allProtos = []
        }
        return Proto._allProtos
    },

    registerThisProto: function() {
        if (this.allProtos().contains(this)) {
            throw new Error("attempt to register same proto twice")
        }
        this.allProtos().push(this)
        return this
    },

    _childProtos: [],
    _allDescendantProtos: null,
    
    cloneWithoutInit: function () {
        const obj = Object.clone(this);
        obj.class = this
        obj._isClass = false // will get set again in newSubclassNamed
        //obj.__proto__ = this; // unneeded
        //this.constructor.name = typeString

        return obj;
    },

    thisClass: function() {
        if (this.isClass()) {
            return this
        }
        assert(this.__proto__.isClass())
        return this.__proto__
    },

    clone: function () {
        const obj = this.cloneWithoutInit()
        obj.init()
        return obj
    },

    _isClass: true,

    isInstance: function() {
        return !this._isClass
    },

    isClass: function() {
        return this._isClass
    },

    newSubclassNamed: function(name) {
        const newClass = this.cloneWithoutInit()
        newClass.registerThisProto()
        newClass._parentProto = this
        newClass._childProtos = [] // need to create these slots so they won't be inherited
        this.addChildProto(newClass)

        newClass._type = name
        newClass._superClass = this
        newClass._isClass = true
        window[name] = newClass
        return newClass
    },

    /*
    initClass: function() {

    }
    */

    superClass: function() {
        return this._superClass
    },
    
    /*
    superProxy: function() {
        // work in progress
        // need a way to track where each method is invoked

        const getHandler = {}
        getHandler.get = function(target, methodName, receiver) {
            return function() {
                console.log("----------------------------------")
                const superClass = target.superClass()
                console.log(target.typeId() + "." + methodName)
                console.log("superClass = " + superClass.typeId())
                const superClassMethod = superClass[methodName]
                console.log("superClassMethod = ", superClassMethod)


                return superClassMethod.apply(target, arguments)
            }
        }
        return new Proxy(this, getHandler);
    },
    */


    addChildProto: function(aProto) {
        this._childProtos.push(aProto)

        /*
        if (this._childProtos.contains(this)) {
            console.log(this.typeId())
            console.log(this._childProtos.map(function(child) { return child.type() }))
            throw "detected loop in childProtos"
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

    typeId: function () {
        return this.typePuuid()
    },

    getClassVariable: function(name, defaultValue) {
        const proto = this.isClass() ? this : this.thisClass()

        if (Type.isUndefined(proto)) {
            let isClass = this.isClass()
            let aClass  = this.thisClass()
        }

        if (!proto.hasOwnProperty(name)) {
            proto[name] = defaultValue
        } 
        return proto[name]
    },


    /*
    newUniqueInstanceId: function() {
        const uuid_a = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        const uuid_b = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        return uuid_a + uuid_b
    },
    */

    // --- type ---

    //Proto.newSlot("isDebugging", false);

    _isDebugging: false,

    isDebugging: function() {
        return this._isDebugging
    },

    setIsDebugging: function(aBool) {
        this._isDebugging = aBool
        return this
    },


    // --- type ---

    _type: "ideal.Proto",

    type: function() {
        return this._type
    },

    setType: function(typeString) {
        this._type = typeString
        this.constructor.name = typeString
        return this
    },

    // ---

    /*
    withSets: function (sets) {
        return this.clone().performSets(sets);
    },

    withSlots: function (slots) {
        return this.clone().setSlots(slots);
    },
    */

    init: function () { 
        // subclasses should override to do initialization
        //console.log(this.typeId() + " isInstance " + this.isInstance())
    },

    sharedInstanceForClass: function(aClass) {   
        if (!aClass._shared) {
            aClass._shared = this.clone();
        }
        return aClass._shared;
    },

    toString: function () {
        return this._type;
    },

    /*
    setSlotsIfAbsent: function (slots) {
        Object.eachSlot(slots,  (name, value) => {
            if (!this[name]) {
                this.setSlot(name, value);
            }
        });
        return this;
    },
    */

    slotNamed: function(slotName) {
        const slots = this.allSlots()
        if (slots.hasOwnProperty(slotName)) {
            return slots[slotName]
        }
        return null 
    },


    slots: function() {
        return this.getClassVariable("_slots", {})
    },

    allSlots: function(allSlots = {}) {
        Object.assign(allSlots, this.slots())
        const superclass = this.superClass()
        assert(this !== superclass)
        if (superclass && superclass.allSlots) {
            superclass.allSlots(allSlots)
        }
        return allSlots
    },

    newSlot: function (slotName, initialValue = null) {
        assert(Type.isString(slotName))
        if (this.slots()[slotName]) {
            this.slots()[slotName]
        }
        assert(Type.isUndefined(this.slots()[slotName]))

        const slot = ideal.Slot.clone().setName(slotName).setInitValue(initialValue).setOwner(this).setupInOwner()
        this.slots()[slotName] = slot

        return this;
    },

    updateSlot: function (slotName, privateName, newValue) {
        const oldValue = this[privateName];
        if (oldValue !== newValue) {
            this[privateName] = newValue;
            
            /*
            if (privateName === "_type") {
                this.contructor.name = newValue
            }
            */

            this.didUpdateSlot(slotName, oldValue, newValue)
        }

        return this;
    },

    didUpdateSlot: function (slotName, oldValue, newValue) {
        // persistence system can hook this
    },


    ownsSlot: function (name) {
        return this.hasOwnProperty(name);
    },

    respondsTo: function(methodName) {
        const func = this[methodName];
        const doesRespond = Type.isFunction(func);
        return doesRespond;
    },

    /*
    aliasSlot: function (slotName, aliasName) {
        this[aliasName] = this[slotName];
        this["set" + aliasName.capitalized()] = this["set" + slotName.capitalized()];
        return this;
    },
    */

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

    /*
    performGets: function (slots) {
        const object = {};
        slots.forEach( (slot) => {
            object[slot] = this.perform(slot);
        });

        return object;
    },
    */

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
        return this.typeId();
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
        //this.debugLog(" firstAncestorWithMatchingPostfixClass(" + aPostfix + ")")
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

    debugLog: function (s) {
        if (this.isDebugging()) {
            if (Type.isFunction(s)) {
                // we provide this option in case what we print in the debug
                // is expensive to compute (if only because it's done so often), 
                // so we can skip it if not debugging
                s = s() 
            }

            const label = this.typeId()
            console.log(label + ": " + s)
        }
        return this
    },

    typeClass: function() {
        return window[this.type()]
    },

    // a way to get a dictionary archive of 
    // a node and it's decendants
    // this could potentially be dragged out of one browser as a textClipping
    // and dragged into another

    copyArchiveDict: function() {
        const dict = {}
        const copyNode = this.copy(dict)

        const store = {}
        const copyArchiveDict = { 
            type: "CopyArchive",
            store: store,
            rootId: copyNode.pid()
        }

        Object.keys(dict).forEach((pid) => {
            const obj = dict[pid]
            store[pid] = obj.nodeDict()
        })

        return copyArchiveDict
    },

    // --- copying protocol --- 
    // a copyDict is created if missing and passed
    // to store the mapping of previous typeIds to new (copied) objects

    copy: function(copyDict) { 
        //const id = this.pid() 
        const id = this.typeId() 

        if (!copyDict) { 
            copyDict = {} // TODO: use a CopyContext object? copyContext.getCopyOfTypeId(id)
        }

        const obj = copyDict[id]
        if (!Type.isUndefined(obj)) {
            return obj
        }

        const newObject = this.typeClass().clone()
        copyDict[id] = newObject
        newObject.copyFrom(this, copyDict)
        return newObject
    },

    copyFrom: function(aNode, copyDict) {

        const shallowNames = this.shallowCopySlotnames()
        shallowNames.forEach((slotName) => {
            this.shallowCopySlotFrom(slotName, aNode, copyDict)
        })

        const deepNames = this.deepCopySlotnames()
        deepNames.forEach((slotName) => {
            this.deepCopySlotFrom(slotName, aNode, copyDict)
        })

        return this
    },

    shallowCopySlotnames: function() {
        return []
    },

    deepCopySlotnames: function() {
        return []
    },

    /*
    asShallowCopyMember: function(copyDict) {
        if (this.pid) {
            const newValue = copyDict[oldValue.pid()]
            if (Type.isUndefined(newValue)) { // not in copy dict
                newValue
            }
        }
        return this
    },
    */

    shallowCopySlotFrom: function(slotName, anObject, copyDict) {
        const oldValue = anObject.getUsingSlotName(slotName)
        let newValue = undefined
        
        if (!Type.isNullOrUndefined(oldValue)) {
            if (oldValue.pid) {
                newValue = copyDict[oldValue.pid()]
            }
        }

        if (Type.isUndefined(newValue)) { // not in copy dict
            newValue = oldValue
        }

        this.setUsingSlotName(slotName, newValue)
        return this
    },

    deepCopySlotFrom: function(slotName, anObject, copyDict) {
        const oldValue = anObject.getUsingSlotName(slotName)
        let copiedValue = oldValue

        if (!Type.isNull(oldValue) && oldValue.copy) {
            copiedValue = oldValue.copy(copyDict)
        }

        this.setUsingSlotName(slotName, copiedValue)

        return this
    },

    getUsingSlotName: function(slotName) {
        return this[slotName].apply(this)
    },

    setUsingSlotName: function(slotName, aValue) {
        const setterName = this.setterNameForSlot(slotName)
        return this[setterName].apply(this, [aValue])
    },

    // encapsulation helpers

    /*
    // these are dangerous becuase sets fail silently

    frozenVersion: function() {
        const obj = Object.clone(this)
        Object.freeze(obj)
        return obj
    },

    sealedVersion: function() {
        const obj = Object.clone(this)
        Object.seal(obj)
        return obj
    },
    */

    defaultStore: function() {
        //return ObjectPool.shared()
        return NodeStore.shared()
    },
});




