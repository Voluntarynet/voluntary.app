//"use strict"

/*

    Object-ideal
    
    Object isn't a prototype or class, it's more like a namespace to organize
    some functions that take an object as an argument. JS ugliness.

*/


Object.clone = function (obj) {
    const Proto_constructor = new Function;
    Proto_constructor.prototype = obj;
    const instance = new Proto_constructor;
    instance.constructor = Proto_constructor
    return instance
}

Object.shallowCopy = function (obj) {
    return Object.assign({}, obj);
}

Object.eachSlot = function (obj, fn) {
    Object.getOwnPropertyNames(obj).forEach(function (name) {
        fn(name, obj[name]);
    });
}

/*
Object.lookupPath = function (obj, path) {
    path = path.split(".");
    let pc;
    while (obj && (pc = path.shift())) {
        obj = obj[pc];
    }
    return obj;
},
*/

Object.perform = function (obj, name) {
    if (obj !== undefined && obj !== null && obj[name] && typeof(obj[name]) === "function") {
        const args = Array.prototype.slice.call(arguments).slice(2);
        return obj[name].apply(obj, args);
    } else {
        return obj;
    }
}

Object.values = function (obj) {
    const values = [];
    for (let name in obj) {
        if (obj.hasOwnProperty(name)) {
            values.push(obj[name]);
        }
    }
    return values;
}

/*
Object.pop = function (obj) {
    const k = Object.keys().last();
    const v = obj[k];
    delete obj[k];
    return v;
}
*/

// --- deep keys ---

Object.atDeepKey = function (obj, key, seenSet) {
    if (typeof(obj) !== "object" /* || (Object.getPrototypeOf(obj) !== Object.prototype)*/) {
        return null;
    }

    if (!seenSet) {
        seenSet = new Set()
    }

    if (seenSet.has(obj)) {
        return null
    }

    seenSet.add(obj)

    for (let k in obj) {
        //console.log("k = ")
        if (obj.hasOwnProperty(k)) {
            if (k === key) {
                return obj[k];
            }
        }
    }

    for (let k in obj) {
        try {
            if (obj.hasOwnProperty(k)) {
                const v = Object.atDeepKey(obj[k], key, seenSet);
                if (v !== null) {
                    return v;
                }
            }
        } catch (e) {
            console.log("on key '" + k + "' caught error:", e)
        }
    }

    return null;
}

Object.allAtDeepKey = function (obj, key) {
    if (typeof(obj) !== "object" || (Object.getPrototypeOf(obj) !== Object.prototype)) {
        return [];
    }

    const objs = [];

    for (let k in obj) {
        if (obj.hasOwnProperty(k)) {
            if (k === key) {
                objs.append(obj[k]);
            }
            else {
                objs.appendItems(Object.allAtDeepKey(obj[k], key));
            }
        }
    }

    return objs;
}

Object.atPath = function (obj, pathList) {
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
}

Object.slotNames = function (obj) {
    return Object.keys(obj);
}

Object.slotValues = function (obj) {
    const values = [];
    for (let k in this) {
        if (obj.hasOwnProperty(k)) {
            values.push(this[k]);
        }
    }
    return values;
}

/*

// --- Objective-C like associations ---

Object._allAssociations = new WeakMap()

Object.prototype.associations = function () {
    let m = Object._allAssociations

    if (!m.has(this)) {
        m.set(this, {})
    }

    return m.get(this)
}

Object.prototype.associationAt = function (k) {
    return this.associations()[k]
}
*/
