//"use strict"

/*

    Object-ideal
    
    Object isn't a prototype or class, it's more like a namespace to organize
    some functions that take an object as an argument. JS ugliness.

    NOTES:
    
    A few weird JS things:

    The Array, Set, and Map constructors do not inherit from Object 
    (they and the Object constructor all inherit from constructor named "")
    but their constructor prototypes *do* inherit from Object.prototype.

    To make this consistent (so we can inherit class methods) we do:

        [Array, Set, Map].forEach(aClass => aClass.__proto__ = Object)

*/

[Array, Set, Map].forEach(aClass => aClass.__proto__ = Object)

/*
Object.hasOwnSlot = function(obj, slotName, slotValue) {
    const descriptor = Object.getOwnPropertyDescriptor(slotName)
    if (descriptor) {
        if (Type.isUndefined(slotValue) || this[slotName] === slotValue) {
            return true
        }
    }
    return false
}
*/

Object.defineSlot = function(obj, slotName, slotValue) {
    //if (!Object.hasOwnSlot(obj, slotName, slotValue)) {
    const descriptor = {
        configurable: true,
        enumerable: false,
        value: slotValue,
        writable: true,
    }
    Object.defineProperty(obj, slotName, descriptor)
    //}
}

/*
window.Test = class Test {
    setup () {
        this._foo = 123
    }
}

Object.defineSlot(Test.prototype, "_foo", "bar")

let test = new Test()
test.setup()

console.log(test)
let d = Reflect.getOwnPropertyDescriptor(test, "_foo")
console.log(d)

if(d.enumerable) {
    console.log("is enumerable")
} else {
    console.log("is not enumberable")
}
*/

Object.defineSlotIfNeeded = function(obj, slotName, slotValue) {
    if (this.hasOwnProperty(slotName)) {
        this[slotName] = slotValue
    } else {
        Object.defineSlot(obj, slotName, slotValue)
    }
}


Object.defineSlots = function(obj, dict) {
    Object.keys(dict).forEach((slotName) => {
        const slotValue = dict[slotName]
        Object.defineSlot(obj, slotName, slotValue)
    })
}

const classSlots = {

    clone: function() {
        const obj = new this()
        obj.init()
        return obj
    },

    type: function() {
        return this.name
    },

    isClass: function() {
        return true
    },

    initThisClass: function () {
        if (this.prototype.hasOwnProperty("initPrototype")) {
            this.prototype.initPrototype.apply(this.prototype)
        }
        this.addToClasses(this)
        return this
    },

    addToClasses: function(aClass) {
        /*
        //console.log("initThisClass: ", this)
        if (window.Object.allClasses().contains(this)) {
            throw new Error("attempt to call initThisClass twice on the same class")
        }

        Object.allClasses().push(this)
        */
        return this
    },

    /*
    shallowCopy: function (obj) {
        return Object.assign({}, obj);
    },
    */
    
    eachSlot: function (obj, fn) {
        Object.keys(obj).forEach(k => fn(k, obj[k]) )
    },
    
    values: function (obj) {
        const values = [];
        obj.ownForEachKV((k, v) => values.push(v))
        return values;
    },

    isKindOf: function(aClass) {
        //assert(this.isClass())
        //assert(aClass.isClass())
        
        if (this.name === "") {
            // anything touching the root "" class seems to crash Chrome,
            // so let's be carefull to leave it along
            return false
        }

        if (this === aClass) {
            return true 
        }
        
        let proto = this.__proto__
        if (proto && proto.name !== "") {
            return proto.isKindOf.apply(proto, [aClass])
        }

        return false
    },


}

Object.defineSlots(Object, classSlots)

// --- prototype ---

const prototypeSlots = {

    initPrototype: function() {
        Object.defineSlot(this, "_isFinalized", false) 
        Object.defineSlot(this, "_mutationObservers", null) 
        Object.defineSlot(this, "_shouldStore", true)
    },

    clone: function () {
        let obj = new this()
        /*
        let aClass = this.thisClass()
        assert(aClass !== this)
        let obj = aClass.clone()
        */
        return obj
    },

    init: function() {
        this.scheduleFinalize()
    },

    isPrototype: function() {
        return this.constructor.prototype === this 
    },
    
    isInstance: function() {
        return !this.isPrototype()
    },

    isClass: function() {
        return false
    },

    thisClass: function() {
        if (this.isPrototype()) {
            return this.constructor
        }
        return this.__proto__.constructor
    },

    thisPrototype: function() {
        assert(this.isInstance())
        const prototype = this.__proto__
        assert(prototype.isPrototype)
        return prototype
    },

    type: function() {
        return this.constructor.name
    },


    // --- mutation ---
   
    mutatorMethodNamesSet: function () {
        throw new Error("undefined mutatorMethodNamesSet on '" + this.type() + "' class")
    },

    setupMutatorHooks: function() {
        this.mutatorMethodNamesSet().forEach((slotName) => {
            const unhookedName = "unhooked_" + slotName
            const unhookedFunction = this[slotName]

            Object.defineSlot(this, unhookedName, unhookedFunction)

            const hookedFunction = function() {
                this.willMutate(slotName)
                const result = this[unhookedName].apply(this, arguments)
                this.didMutate(slotName)

                /*
                let argsString = []
                for (let i=0; i < arguments.length; i++) {
                    if (i !== 0) { argsString += ", " }
                    argsString += String(arguments[i])
                }
                console.log("hooked Array " + slotName + "(" + argsString + ")") 
                console.log("result = " + result)
                */

                return result
            }

            Object.defineSlot(this, slotName, hookedFunction)
        })
    },

    willMutate: function() {

    },

    didMutate: function() {

    },

    // -------------------
    
    shallowCopy: function () {
        return Object.assign({}, this);
    },

    at (key) {
        return this[key] 
    },

    atPut(key, value) {
        this[key] = value
        return this
    },

    removeAt (key) {
        delete this[key]
        return this
    },

    ownForEachValue: function(fn) {
        Object.keys(this).forEach( k => fn(this[k]) )
        return this
    },

    ownForEachKey: function(fn) {
        Object.keys(this).forEach( k => fn(k) )
        return this
    },
    
    ownForEachKV: function(fn) {    
        Object.keys(this).forEach( k => fn(k, this[k]) )
        return this
    },

    /*
    mapToArrayKV: function(fn) {
        const m = []
        Object.keys(this).forEach((k) => {
            const v = this[k]
            const r = fn(k, v)
            m.push(r)
        }); 
        return m
    },
    */

    isEqual: function(anObject) { 
        // compare like we would two dictionaries
        // only checks enumerable properties
        const keys = Object.keys(this)
        const otherKeys = Object.keys(anObject)
        if (keys.length !== otherKeys.length) {
            return false
        }

        const foundInequality = keys.detect(k => this.getOwnProperty(k) !== anObject.getOwnProperty(k))
        return !foundInequality
    },

    getOwnProperty: function(key) {
        if (this.hasOwnProperty(key)) {
            return this[key]
        }
        return undefined
    },

    /*
    setOwnProperty: function(key, value) {
        Object.defineSlot(this, key, value)
        return this
    },
    */

    isKindOf: function(aClass) {
        //assert(!this.isClass())
        return this.thisClass().isKindOf(aClass)
    },

    // --- finalize ---
    //
    //  we don't want to scheduleSyncToStore while the object is initializing
    // (e.g. while it's being unserialized from a store)
    // so only scheduleSyncToStore if isFinalized is true, and set it to true
    // when finalize is called by the ObjectStore after 


    isFinalized: function() {
        return this.getOwnProperty("_isFinalized") === true
    },

    setIsFinalized: function(aBool) {
        Object.defineSlot(this, "_isFinalized", aBool)
        return this
    },

    finalize: function() {
        assert(!this.isFinalized())
        // for subclasses to override if needed
        this.setIsFinalized(true)
    },

    didLoadFromStore: function() {
    },

    scheduleFinalize: function () {
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this, "finalize")
        this.finalize()
    },

    scheduleLoadFinalize: function() {
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this, "loadFinalize")
        this.loadFinalize()
    },

    loadFinalize: function() {
        // for subclasses to override
    },

    // --- shouldStore ---

    setShouldStore: function(aBool) {
        if (aBool != this._shouldStore) {
            //this.willMutate("shouldStore")
            Object.defineSlot(this, "_shouldStore", aBool)
            //this.didMutate("shouldStore")
        }
        return this
    },

    shouldStore: function() {
        return this._shouldStore
    },

    typeCategory: function() {
        if (this.isInstance()) {
            return "instance"
        } else if (this.isPrototype()) {
            return "prototype" 
        } else if (this.isClass()) {
            return "class" 
        } 
        throw new Error("unable to identify")
    },

    fullTypeName: function() {
        return this.type() + " " + this.typeCategory()
    },

    slotValuePath: function(slotName, entries = []) {
        const entry = [this.fullTypeName(), this.getOwnProperty(slotName)] 
        entries.push(entry)

        const proto = this.__proto__
        if (proto) { // Object.prototype.__proto__ = null
            //proto.constructor.name !== "") {
            return proto.slotValuePath.apply(proto, [slotName, entries])
        }
        
        return entries
    }
}


Object.defineSlots(Object.prototype, prototypeSlots)

Object.initThisClass()