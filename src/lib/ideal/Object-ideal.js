"use strict"

/*
    Object isn't a prototype or class, it's more like a namespace to organize
    some functions that take an object as an argument. JS ugliness.
*/

Object.clone = function (obj) {
    var Proto_constructor = new Function;
    Proto_constructor.prototype = obj;
    var instance = new Proto_constructor;
    instance.constructor = Proto_constructor
    return instance
}

Object.shallowCopyTo = function (fromObj, toObj) {
    Object.eachSlot(fromObj, function (name) {
        toObj[name] = fromObj[name];
    });
    return toObj;
}

Object.shallowCopy = function (obj) {
    return Object.shallowCopyTo(obj, {});
}

Object.eachSlot = function (obj, fn) {
    Object.getOwnPropertyNames(obj).forEach(function (name) {
        fn(name, obj[name]);
    });
}

Object.lookupPath = function (obj, path) {
    path = path.split(".");
    var pc;
    while (obj && (pc = path.shift())) {
        obj = obj[pc];
    }
    return obj;
},

Object.perform = function (obj, name) {
    if (obj !== undefined && obj !== null && obj[name] && typeof (obj[name]) == "function") {
        var args = Array.prototype.slice.call(arguments).slice(2);
        return obj[name].apply(obj, args);
    } else {
        return obj;
    }
}

Object.values = function (obj) {
    var values = [];
    for (var name in obj) {
        if (obj.hasOwnProperty(name)) {
            values.push(obj[name]);
        }
    }
    return values;
}

Object.pop = function (obj) {
    var k = Object.keys().last();
    var v = obj[k];
    delete obj[k];
    return v;
}

// --- deep keys ---

Object.atDeepKey = function (obj, key, seenSet) {
    if (typeof (obj) != "object" /* || (Object.getPrototypeOf(obj) != Object.prototype)*/) {
        return null;
    }

    if (!seenSet) {
        seenSet = new Set()
    }

    if (seenSet.has(obj)) {
        return null
    }

    seenSet.add(obj)

    for (var k in obj) {
        //console.log("k = ")
        if (obj.hasOwnProperty(k)) {
            if (k == key) {
                return obj[k];
            }
        }
    }

    for (var k in obj) {
        try {
            if (obj.hasOwnProperty(k)) {
                var v = Object.atDeepKey(obj[k], key, seenSet);
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
    if (typeof (obj) !== "object" || (Object.getPrototypeOf(obj) != Object.prototype)) {
        return [];
    }

    var objs = [];

    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            if (k == key) {
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
    if (typeof (pathList) == "string") {
        pathList = pathList.split("/");
    }

    if (typeof (obj) !== "object" || (Object.getPrototypeOf(obj) != Object.prototype) || !pathList.length) {
        return null;
    }

    var k = pathList.first();
    var pathList = pathList.rest();

    if (pathList.length) {
        return Object.atPath(obj[k], pathList);
    }

    if (k == "") {
        return obj;
    }

    return Array.wrap(obj[k]).first();
}

Object.slotNames = function (obj) {
    return Object.keys(obj);
}

Object.slotValues = function (obj) {
    var values = [];
    for (var k in this) {
        if (obj.hasOwnProperty(k)) {
            values.push(this[k]);
        }
    }
    return values;
}


// --- Objective-C like associations ---

Object._globalAssocationWeakMap = new WeakMap()

Object.associationDict = function (obj) {
    var map = Object._globalAssocationWeakMap

    if (!map.has(obj)) {
        map.set(obj, {})
    }

    return map.get(obj)
}

// --- forwardErrors ---------------------------

Function.prototype.forwardErrors = function (fn) {
    return () => {
        var e = arguments[0];
        if (e) {
            this(e);
        } else {
            fn.apply(null, Array.prototype.slice.call(arguments, 1));
        }
    }
}
