//"use strict"

/*

    Object-ideal
    
    Object isn't a prototype or class, it's more like a namespace to organize
    some functions that take an object as an argument. JS ugliness.

*/

Object.defineSlots = function(obj, dict) {
    Object.keys(dict).forEach((slotName) => {
        const slotValue = dict[slotName]
        const descriptor = {
            configurable: true,
            enumerable: false,
            value: slotValue,
            writable: true,
        }
        Object.defineProperty(obj, slotName, descriptor)
    })
}

Object.defineSlots(Object, {
    clone: function (obj) {
        const Proto_constructor = new Function;
        Proto_constructor.prototype = obj;
        const instance = new Proto_constructor;
        instance.constructor = Proto_constructor
        return instance
    },
    
    shallowCopy: function (obj) {
        return Object.assign({}, obj);
    },
    
    eachSlot: function (obj, fn) {
        Object.getOwnPropertyNames(obj).forEach(function (k) {
            fn(k, obj[k]);
        });
    },

    perform: function (obj, name) {
        if (obj !== undefined && obj !== null && obj[name] && typeof(obj[name]) === "function") {
            const args = Array.prototype.slice.call(arguments).slice(2);
            return obj[name].apply(obj, args);
        } else {
            return obj;
        }
    },
    
    values: function (obj) {
        const values = [];
        for (let name in obj) {
            if (obj.hasOwnProperty(name)) {
                values.push(obj[name]);
            }
        }
        return values;
    },
    
    atPath: function (obj, pathList) {
        if (typeof(pathList) === "string") {
            pathList = pathList.split("/");
        }
    
        if (typeof(obj) !== "object" || (Object.getPrototypeOf(obj) !== Object.prototype) || !pathList.length) {
            return null;
        }
    
        const k = pathList.first();
        pathList = pathList.rest();
    
        if (pathList.length) {
            return Object.atPath(obj[k], pathList);
        }
    
        if (k === "") {
            return obj;
        }
    
        return Array.wrap(obj[k]).first();
    },
    
    slotNames: function (obj) {
        return Object.keys(obj);
    },
    
    slotValues: function (obj) {
        const values = [];
        for (let k in this) {
            if (obj.hasOwnProperty(k)) {
                values.push(this[k]);
            }
        }
        return values;
    },
})


Object.defineSlots(Object.prototype, {
    forEachKV: function(fn) {    
        Object.getOwnPropertyNames(this).forEach((k) => {
            const v = this[k]
            fn(k, v);
        });
        return this
    },

    mapToArrayKV: function(fn) {
        let m = []
        Object.getOwnPropertyNames(this).forEach((k) => {
            const v = this[k]
            const r = fn(k, v)
            m.push(r)
        }); 
        return m
    },
})

// --- Objective-C like associations ---

Object.defineSlots(Object, {

    _allAssociations: new WeakMap(),
    
})


Object.defineSlots(Object.prototype, {

    associations: function () {
        let m = Object._allAssociations

        if (!m.has(this)) {
            m.set(this, {})
        }

        return m.get(this)
    },

    associationAt: function (k) {
        return this.associations()[k]
    },

})


