"use strict"

Object.clone = function (obj) {
    Proto_constructor.prototype = obj;
    return new Proto_constructor;
},

Object.shallowCopy = function (obj) {
    return Object.shallowCopyTo(obj, {});
},

Object.shallowCopyTo = function (fromObj, toObj) {
    Object.eachSlot(fromObj, function (name) {
        toObj[name] = fromObj[name];
    });

    return toObj;
},

Object.eachSlot = function (obj, fn) {
    Object.getOwnPropertyNames(obj).forEach(function (name) {
        fn(name, obj[name]);
    });
},

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
    }
    else {
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



// --- forwardErrors ---------------------------

Function.prototype.forwardErrors = function (fn) {
    var self = this;
    return function () {
        var e = arguments[0];
        if (e) {
            self(e);
        } else {
            fn.apply(null, Array.prototype.slice.call(arguments, 1));
        }
    }
}


function Object_atDeepKey(obj, key) {
    if (typeof (obj) !== "object" || (Object.getPrototypeOf(obj) != Object.prototype)) {
        return null;
    }

    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            if (k == key) {
                return obj[k];
            }
            else {
                var v = Object_atDeepKey(obj[k], key);
                if (v !== null) {
                    return v;
                }
            }
        }
    }

    return null;
}

function Object_allAtDeepKey(obj, key) {
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
                objs.appendItems(Object_allAtDeepKey(obj[k], key));
            }
        }
    }

    return objs;
}

function Object_atPath(obj, pathList) {
    if (typeof (pathList) == "string") {
        pathList = pathList.split("/");
    }

    if (typeof (obj) !== "object" || (Object.getPrototypeOf(obj) != Object.prototype) || !pathList.length) {
        return null;
    }

    var k = pathList.first();
    var pathList = pathList.rest();

    if (pathList.length) {
        return Object_atPath(obj[k], pathList);
    }
    else if (k == "") {
        return obj;
    }
    else {
        return Array.wrap(obj[k]).first();
    }
}




// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

/// Object

Object.ancestors = function(self) {
    var results = []
    var obj = self;
    while (obj.__proto__ && obj.type) {
        results.push(obj)
        if (results.length > 100) {
            throw new Error("proto loop detected?")
        }
        obj = obj.__proto__
    }
    return results
}

Object.ancestorTypes = function(self) {
    return self.ancestors().map((obj) => { return obj.type() })
}


Object.firstAncestorWithMatchingPostfixClass = function(self, aPostfix) {
    // not a great name but this walks back the ancestors and tries to find an
    // existing class with the same name as the ancestor + the given postfix
    // useful for things like type + "View" or type + "RowView", etc
    //console.log(this.type() + " firstAncestorWithMatchingPostfixClass(" + aPostfix + ")")
    var match = Object.ancestors(self).detect((obj) => {
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
},

Object.slotNames = function(self) {
    return Object.keys(self);
}

Object.slotValues = function(self) {
    var values = [];
    for (var k in this) {
        if (self.hasOwnProperty(k)) {
            values.push(this[k]);
        }
    }
    return values;
}


// Objective-C like associations

Object._globalAssocationWeakMap = new WeakMap()

Object.associationDict = function(self) {
    var map = Object._globalAssocationWeakMap
    
    if (!map.has(self)) {
        map.set(self, {})
    }
    
    return map.get(self)
}

