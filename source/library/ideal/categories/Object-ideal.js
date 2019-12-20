//"use strict"

/*

    Object-ideal
    
    Object isn't a prototype or class, it's more like a namespace to organize
    some functions that take an object as an argument. JS ugliness.

*/


/*

    NOTES:
    
    A few weird JS things:

    The Array, Set, and Map constructors do not inherit from Object 
    (they and the Object constructor all inherit from constructor named "")
    but their constructor prototypes *do* inherit from Object.prototype.

    To make this consistent (so we can inherit class methods) we do:

        [Array, Set, Map].forEach(aClass => aClass.__proto__ = Object)

*/

[Array, Set, Map].forEach(aClass => aClass.__proto__ = Object)


Object.defineSlot = function(obj, slotName, slotValue) {
    const descriptor = {
        configurable: true,
        enumerable: false,
        value: slotValue,
        writable: true,
    }
    Object.defineProperty(obj, slotName, descriptor)
}

Object.defineSlotIfNeeded = function(obj, slotName, slotValue) {
    if (this.hasOwnProperty(slotName)) {1111111111
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
        Object.getOwnPropertyNames(obj).forEach(k => fn(k, obj[k]) )
    },
    
    values: function (obj) {
        const values = [];
        obj.ownForEachKV((k, v) => values.push(v))
        return values;
    },

}

Object.defineSlots(Object, classSlots)
/*
Object.defineSlots(Array, classSlots)
Object.defineSlots(Set, classSlots)
Object.defineSlots(Map, classSlots)
*/

// --- prototype ---

const prototypeSlots = {

    initPrototype: function() {
        Object.defineSlot(this, "_isFinalized", false) 
        Object.defineSlot(this, "_mutationObservers", null) 
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
    
    ownForEachKV: function(fn) {    
        Object.getOwnPropertyNames(this).forEach((k) => {
            const v = this[k]
            fn(k, v);
        });
        return this
    },

    mapToArrayKV: function(fn) {
        const m = []
        Object.getOwnPropertyNames(this).forEach((k) => {
            const v = this[k]
            const r = fn(k, v)
            m.push(r)
        }); 
        return m
    },

    isEqual: function(anObject) { // only checks enumerable properties
        const keys = Object.getOwnPropertyNames(this)
        if (keys.length !== Object.getOwnPropertyNames(anObject).length) {
            return false
        }

        const foundInequality = keys.detect(k => this.hasOwnProperty(k) !== anObject.hasOwnProperty(k))
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
        this[key] = value
        return this
    },
    */

    isKindOf: function(aClass) {
        if (this.constructor) {
            if (this.constructor === aClass) {
                return true
            }

            let proto = this.__proto__

            if (proto) {
                return proto.isKindOf.apply(proto, [aClass])
            }
        }

        return false
    },


    // --- storage ---

    // is finalized
    //
    //  we don't want to scheduleSyncToStore while the object is initializing
    // (e.g. while it's being unserialized from a store)
    // so only scheduleSyncToStore if isFinalized is true, and set it to true
    // when finalize is called by the ObjectStore after 


    isFinalized: function() {
        return this.getOwnProperty("_isFinalized") === true
    },

    setIsFinalized: function(aBool) {
        this._isFinalized = aBool
        return this
    },

    finalize: function() {
        assert(!this.isFinalized())
        // for subclasses to override if needed
        this.setIsFinalized(true)
    },

    // finalize

    didLoadFromStore: function() {
    },

    scheduleFinalize () {
        assert(!this.isFinalized())
        this.setIsFinalized(true) // only BMNode schedules this
    },


    scheduleFinalize: function () {
        // Object scheduleFinalize just calls this.finalize()
        assert(!this.isFinalized())
        this.setIsFinalized(true)
    },

    scheduleLoadFinalize: function() {
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this, "loadFinalize")
        this.loadFinalize()
    },

    loadFinalize: function() {
        // for subclasses to override
    },

}


Object.defineSlots(Object.prototype, prototypeSlots)

Object.initThisClass()