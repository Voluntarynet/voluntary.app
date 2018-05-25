"use strict"

window.ideal = {}


var Proto_constructor = new Function;

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
    if (obj !== undefined && obj !== null && obj[name] && typeof (obj[name]) == 'function') {
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

Object.shallowCopyTo({
    //read
    isEmpty: function () {
        return this.length == 0;
    },

    isEqual: function (otherArray) {
        if (this.length != otherArray.length) { return false; }

        for (var i = 0; i < this.length; i++) {
            if (this[i] != otherArray[i]) return false;
        }

        return true;
    },

    size: function () {
        return this.length;
    },

    at: function (index) {
        if (index > -1) {
            return this[index];
        }
        else {
            return this[this.length + index];
        }
    },

    atModLength: function (index) {
        return this.at(index % this.length)
    },

    first: function () {
        return this[0];
    },

    rest: function () {
        return this.slice(1);
    },

    last: function () {
        return this[this.length - 1];
    },

    contains: function (element) {
        return this.indexOf(element) > -1;
    },

    hasPrefix: function (otherArray) {
        if (this.length < otherArray.length) { return false; }

        for (var i = 0; i < this.length; i++) {
            if (this[i] != otherArray[i]) return false;
        }

        return true;
    },

    itemAfter: function (v) {
        var i = this.indexOf(v);
        if (i == -1) return null;
        i = i + 1;
        if (i > this.length - 1) return null;
        if (this[i] != undefined) { return this[i]; }
        return null;
    },

    itemBefore: function (v) {
        var i = this.indexOf(v);
        if (i == -1) return null;
        i = i - 1;
        if (i < 0) return null;
        if (this[i]) { return this[i]; }
        return null;
    },

    copy: function () {
        return this.slice();
    },

    split: function (subArrayCount) {
        var subArrays = [];

        var subArraySize = Math.ceil(this.length / subArrayCount);
        for (var i = 0; i < this.length; i += subArraySize) {
            var subArray = this.slice(i, i + subArraySize);
            if (subArray.length < subArraySize) {
                var lastSubArray = subArrays.pop();
                if (lastSubArray) {
                    subArray = lastSubArray.concat(subArray);
                }
            }
            subArrays.push(subArray);
        }

        return subArrays;
    },

    chunk: function (chunkSize) {
        return this.split(Math.ceil(this.length / chunkSize));
    },

    //write

    atInsert: function (i, e) {
        this.splice(i, 0, e);
    },

    append: function () {
        this.appendItems.call(this, arguments);
        return this;
    },

    appendItems: function (elements) {
        this.push.apply(this, elements);
        return this;
    },

    appendItemsIfAbsent: function (elements) {
        this.appendIfAbsent.apply(this, elements);
        return this;
    },

    prepend: function (e) {
        this.unshift(e);
        return this;
    },

    appendIfAbsent: function () {
        this.slice.call(arguments).forEach((value) => {
            if (this.indexOf(value) == -1) {
                this.push(value);
                return true;
            }
        })

        return false;
    },

    removeAt: function (i) {
        this.splice(i, 1);
        return this;
    },

    remove: function (e) {
        var i = this.indexOf(e);
        if (i > -1) {
            this.removeAt(i);
        }
        return this;
    },

    emptiesRemoved: function () {
        return this.filter(function (e) {
            return e;
        });
    },

    removeFirst: function () {
        return this.shift();
    },

    removeLast: function () {
        return this.pop();
    },

    removeItems: function (elements) {
        elements.forEach(function (e) { this.remove(e) }, this);
        return this;
    },

    empty: function () {
        this.splice(0, this.length);
        return this;
    },

    replace: function (obj, withObj) {
        var i = this.indexOf(obj);
        if (i > -1) {
            this.removeAt(i);
            this.atInsert(i, withObj);
        }
        return this;
    },

    swap: function (e1, e2) {
        var i1 = this.indexOf(e1);
        var i2 = this.indexOf(e2);

        this[i1] = e2;
        this[i2] = e1;

        return this;
    },

    shuffle: function () {
        var i = this.length;
        if (i == 0) return false;
        while (--i) {
            var j = Math.floor(Math.random() * (i + 1));
            var tempi = this[i];
            var tempj = this[j];
            this[i] = tempj;
            this[j] = tempi;
        }

        return this;
    },

    atRandom: function () {
        return this[Math.floor(Math.random() * this.length)];
    },

    //iterate
    forEachCall: function (functionName) {
        var args = this.slice.call(arguments).slice(1);
        args.push(0);
        this.forEach(function (e, i) {
            args[args.length - 1] = i;
            if (e) {
                var fn = e[functionName];
                if (fn) {
                    fn.apply(e, args);
                }
                else {
                    console.warn("Array.forEachCall: No method " + functionName);
                }
            }
        });
        return this;
    },

    forEachPerform: function () {
        return this.forEachCall.apply(this, arguments);
    },

    sortPerform: function (functionName) {
        var args = this.slice.call(arguments).slice(1);
        return this.sort(function (x, y) {
            var xRes = x[functionName].apply(x, args);
            var yRes = y[functionName].apply(y, args);
            if (xRes < yRes) {
                return -1;
            }
            else if (yRes < xRes) {
                return 1;
            }
            else {
                return 0;
            }
        });
    },

    parallelPerform: function () {
        var args = this.slice.call(arguments).slice();
        var fn = args.pop();

        if (this.length == 0) {
            fn(null);
            return;
        }

        var remaining = this.length;
        var err = null;
        args.push(function (error) {
            err = error;
            remaining--;
            if (remaining == 0) {
                fn(err, ops);
            }
        });

        var ops = this.mapPerform.apply(this, args);
        return this;
    },

    serialPerform: function (functionName) {
        var args = this.slice.call(arguments).slice(1);
        var fn = args.pop();

        if (this.length == 0) {
            fn(null);
            return;
        }

        var i = 0;
        var self = this;
        function next() {
            if (i < self.length) {
                var e = self[i];
                i++;
                e[functionName].apply(e, args);
            } else {
                fn();
            }
        };

        args.push(function (e) {
            if (e) {
                fn(e);
            } else {
                next();
            }
        });

        next();

        return this;
    },

    mapPerform: function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(null);
        args.push(-1);

        return this.map(function (obj, i) {
            args[0] = obj;
            args[args.length - 1] = i; //TODO: should we append i?  Receiver might not expect this ...
            return Object.perform.apply(Object, args);
        });
    },

    mapProperty: function (propertyName) {
        return this.map(function (e) {
            return e[propertyName];
        });
    },

    detect: function (callback) {
        for (var i = 0; i < this.length; i++) {
            if (callback(this[i])) {
                return this[i];
            }
        }

        return null;
    },

    detectPerform: function (functionName) {
        var args = this.slice.call(arguments).slice(1);
        return this.detect(function (e, i) {
            return e[functionName].apply(e, args);
        });
    },

    detectSlot: function (slotName, slotValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].perform(slotName) == slotValue) {
                return this[i];
            }
        }

        return null;
    },

    detectProperty: function (slotName, slotValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i][slotName] == slotValue) {
                return this[i];
            }
        }

        return null;
    },

    detectIndex: function (callback) {
        for (var i = 0; i < this.length; i++) {
            if (callback(this[i])) {
                return i;
            }
        }

        return null;
    },

    everySlot: function (slotName, expectedValue) {
        return this.every(function (obj) {
            return obj.perform(slotName) == expectedValue;
        });
    },

    everyProperty: function (slotName, expectedValue) {
        var args = arguments;
        return this.every(function (obj) {
            if (args.length == 2) {
                return obj[slotName] == expectedValue;
            } else {
                return obj[slotName];
            }
        });
    },

    everyPerform: function () {
        var args = arguments;
        return this.every(function (obj) {
            return obj.perform.apply(obj, args);
        });
    },

    filterPerform: function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(null);
        args.push(0);
        return this.filter(function (e, i) {
            args[0] = e;
            args[args.length - 1] = i;
            return Object.perform.apply(Object, args);
        });
    },

    filterSlot: function (slotName, expectedValue) {
        return this.filter(function (obj) {
            return obj && (obj.perform(slotName) == expectedValue);
        });
    },

    filterProperty: function (slotName, expectedValue) {
        var args = arguments;
        return this.filter(function (obj) {
            if (args.length == 2) {
                return obj[slotName] == expectedValue;
            } else {
                return obj[slotName];
            }
        });
    },

    rejectPerform: function () {
        var args = this.slice.call(arguments);
        args.shift(null);
        args.push(0);
        return this.filter(function (e, i) {
            args[0] = e;
            args[args.length - 1] = i; //TODO: should we append i?  Receiver might not expect this ...
            return e && !Object.perform.apply(Object, args);
        });
    },

    rejectSlot: function (slotName, expectedValue) {
        return this.filter(function (obj) {
            return obj.perform(slotName) != expectedValue;
        });
    },

    minValue: function (callback, theDefault) {
        var obj = this.min(callback);
        if (obj == undefined) {
            return theDefault;
        }
        return callback(obj);
    },

    maxValue: function (callback, theDefault) {
        var obj = this.max(callback);
        if (obj == undefined) {
            return theDefault;
        }
        return callback(obj);
    },

    max: function (callback) {
        var m = undefined;
        var mObject = undefined;
        var length = this.length;

        for (var i = 0; i < length; i++) {
            var v = this[i];
            if (callback) v = callback(v);

            if (m == undefined || v > m) {
                m = v;
                mObject = this[i];
            }
        }

        return mObject;
    },

    maxIndex: function (callback) {
        var m = undefined;
        var index = 0;
        var length = this.length;

        for (var i = 0; i < length; i++) {
            var v = this[i];
            if (callback) v = callback(v);

            if (m == undefined || v > m) {
                m = v;
                index = i;
            }
        }

        return index;
    },

    min: function (callback) {
        var m = undefined;
        var mObject = undefined;
        var length = this.length;

        for (var i = 0; i < length; i++) {
            var v = this[i];
            if (callback) v = callback(v);

            if (m == undefined || v < m) {
                m = v;
                mObject = this[i];
            }
        }

        return mObject;
    },

    minIndex: function (callback) {
        var m = undefined;
        var index = 0;
        var length = this.length;

        for (var i = 0; i < length; i++) {
            var v = this[i];
            if (callback) v = callback(v);

            if (m == undefined || v < m) {
                m = v;
                index = i;
            }
        }

        return index;
    },

    sum: function (callback) {
        var m = undefined;
        var sum = 0;
        var length = this.length;

        for (var i = 0; i < length; i++) {
            var v = this[i];
            if (callback) v = callback(v);

            sum = sum + v;
        }

        return sum;
    },

    average: function () {
        return this.sum() / this.length;
    },

    atMidpoint: function () {
        return this.at(Math.floor((this.length - 1) / 2));
    },

    flatten: function () {
        var flattened = [];
        this.forEach(function (array) {
            flattened.appendItems(array);
        });
        return flattened;
    },

    clone: function () {
        return this.copy();
    },

    unique: function () {
        var a = [];
        this.forEach(function (e) {
            a.appendIfAbsent(e);
        });
        return a;
    },

    reversed: function () {
        return this.copy().reverse();
    },

    asPath: function () {
        if (this.length == 1 && this.first() == "") {
            return "/";
        }
        else {
            return this.join("/");
        }
    },

    isAbsolutePath: function () {
        return this.first() == "";
    },

    isRelativePath: function () {
        return this.first() != "";
    },

    isArray: true
}, Array.prototype);

Array.wrap = function (obj) {
    if (obj === null || obj === undefined) {
        return [];
    }
    else if (obj.isArray) {
        return obj;
    }
    else {
        return [obj];
    }
}

// --- string ----

Object.shallowCopyTo({
    isEmpty: function () {
        return this.length == 0;
    },

    beginsWith: function (prefix) {
        if (!prefix) return false;
        return this.indexOf(prefix) == 0;
    },

    endsWith: function (suffix) {
        var index = this.lastIndexOf(suffix);
        return (index > -1) && (this.lastIndexOf(suffix) == this.length - suffix.length);
    },

    contains: function (aString) {
        return this.indexOf(aString) > -1;
    },

    before: function (aString) {
        var index = this.indexOf(aString);
        if (index == -1) {
            return null;
        }
        else {
            return this.slice(0, index);
        }
    },

    after: function (aString) {
        var index = this.indexOf(aString);
        if (index == -1) {
            return null;
        }
        else {
            return this.slice(index + aString.length);
        }
    },

    between: function (prefix, suffix) {
        var after = this.after(prefix);
        if (after != null) {
            var before = after.before(suffix);
            if (before != null) {
                return before;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    },

    at: function (i) {
        return this.slice(i, i + 1);
    },

    first: function () {
        return this.slice(0, 1);
    },

    rest: function () {
        return this.slice(1);
    },

    repeated: function (times) {
        var result = "";
        var aString = this;
        times.repeat(function () { result += aString });
        return result
    },

    prefixRemoved: function (prefix) {
        return this.substring(this.beginsWith(prefix) ? prefix.length : 0);
    },

    suffixRemoved: function (suffix) {
        if (this.endsWith(suffix)) {
            return this.substr(0, this.length - suffix.length);
        }
        else {
            return this;
        }
    },

    stripped: function () {
        return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },

    uncapitalized: function () {
        return this.replace(/\b[A-Z]/g, function (match) {
            return match.toLowerCase();
        });
    },

    asNumber: function () {
        return Number(this);
    },

    //move to libraries?
    humanized: function () //someMethodName -> Some Method Name
    {
        var words = [];
        var start = -1;
        var capitalized = this.capitalized();
        for (var i = 0; i < capitalized.length; i++) {
            if (capitalized.slice(i, i + 1).match(/[A-Z]/)) {
                var word = capitalized.slice(start, i);
                if (word) {
                    words.append(word);
                }
                start = i;
            }
        }
        words.append(capitalized.slice(start, i));
        return words.join(" ");
    },

    titleized: function () {
        return this.split(/\s+/).map(function (s) { return s.capitalized() }).join(" ");
    },

    base64Encoded: function () {
        //btoa(this);
        return new Buffer(String(this), "utf8").toString("base64");
    },

    base64UrlEncoded: function () {
        return this.base64Encoded().replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ',');
    },

    base64Decoded: function () {
        return new Buffer(String(this), "base64").toString("utf8");
        //return atob(this);
    },

    base64UrlDecoded: function () {
        return this.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '=').base64Decoded();
    },

    stringCount: function (str) {
        return this.split(str).length - 1;
    },

    lineCount: function () {
        return this.stringCount("\n");
    },

    pathComponents: function () {
        if (this == "/") {
            return [""];
        }
        else if (this == "") {
            return [];
        }
        else {
            return this.split("/");
        }
    },

    sansLastPathComponent: function () {
        var c = this.pathComponents()
        c.removeLast();
        return c.join("/");
    },

    lastPathComponent: function () {
        return this.pathComponents().last();
    },

    fileNameSuffix: function () {
        var suffix = this.split(".").last();
        return suffix;
    },

    padLeft: function (length, padding) {
        var str = this;
        while (str.length < length) {
            str = padString + str;
        }

        return str.substring(0, length);
    },

    padRight: function (length, padding) {
        var str = this;
        while (str.length < length) {
            str = str + padding;
        }

        return str.substring(0, length);
    },

    strip: function () {
        return String(this).replace(/^\s+|\s+$/g, '');
    },

    asObject: function () {
        return JSON.parse(this);
    }
}, String.prototype);

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
    else if (k == '') {
        return obj;
    }
    else {
        return Array.wrap(obj[k]).first();
    }
}

// -----------------------------------------

function map(obj) {
    return Map.withJsMap(obj || {});
}

Map.__map = map;


Object.shallowCopyTo({
    milliseconds: function () {
        return this;
    },

    seconds: function () {
        return Number(this) * 1000;
    },

    minutes: function () {
        return this.seconds() * 60;
    },

    hours: function () {
        return this.minutes() * 60;
    },

    days: function () {
        return this.hours() * 24;
    },

    years: function () {
        return this.days() * 365;
    },

    repeat: function (callback) {
        for (var i = 0; i < this; i++) {
            if (callback(i) === false) {
                return this;
            }
        }
        return this;
    },

    map: function () {
        var a = [];
        for (var i = 0; i < this; i++) {
            a.push(i);
        }
        return Array.prototype.map.apply(a, arguments);
    },

    isEven: function () {
        return this % 2 == 0;
    }
}, Number.prototype);

// -----------------------------------------


// ----------------------------------

String.prototype.capitalized = function () {
    return this.replace(/\b[a-z]/g, function (match) {
        return match.toUpperCase();
    });
};

// ----------------------------------

var Proto = new Object;
ideal.Proto = Proto

Proto.setSlot = function (name, value) {
    this[name] = value;

    return this;
};

Proto.setSlots = function (slots) {
    var self = this;
    Object.eachSlot(slots, function (name, initialValue) {
        self.setSlot(name, initialValue);
    });
    return this;
}

var uniqueIdCounter = 0;

var Object_hasProto = (Object.prototype.__proto__ !== undefined);
var Object_clone = Object.clone;

Proto.setSlots({
    extend: function () {
        var obj = Object_clone(this);
        if (!Object_hasProto) {
            obj.__proto__ = this;
        }
        obj._uniqueId = ++uniqueIdCounter;
        return obj;
    },

    uniqueId: function () {
        return this._uniqueId
    },

    typeId: function () {
        return this.type() + this.uniqueId()
    },

    subclass: function () {
        console.warn("subclass is deprecated in favor of extend");
        return this.extend.call(this);
    },

    clone: function () {
        var obj = this.extend();
        obj.init();

        return obj;
    },

    withSets: function (sets) {
        return this.clone().performSets(sets);
    },

    withSlots: function (slots) {
        return this.clone().setSlots(slots);
    },

    init: function () { },

    uniqueId: function () {
        return this._uniqueId;
    },

    toString: function () {
        return this._type;
    },

    setSlotsIfAbsent: function (slots) {
        var self = this;
        Object.eachSlot(slots, function (name, value) {
            if (!self[name]) {
                self.setSlot(name, value);
            }
        });
        return this;
    },

    newSlot: function (slotName, initialValue) {
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
    },

    updateSlot: function (slotName, privateName, newValue) {
        var oldValue = this[privateName];
        if (oldValue != newValue) {
            this[privateName] = newValue;
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
        var self = this;
        Object.eachSlot(slots, function (slotName, initialValue) {
            self.newSlot(slotName, initialValue);
        });

        return this;
    },

    canPerform: function (message) {
        return this[message] && typeof (this[message]) == "function";
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
        var setter = this._setterNameMap[name]
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
        var self = this;
        Object.eachSlot(slots, function (name, value) {
            self.perform("set" + name.capitalized(), value);
        });

        return this;
    },

    performGets: function (slots) {
        var self = this;
        var object = {};
        slots.forEach(function (slot) {
            object[slot] = self.perform(slot);
        });

        return object;
    }
});

Proto.toString = function () {
    return this.type() + "." + this.uniqueId();
}

Proto.newSlot("type", "ideal.Proto");


// --- Map ---------------------------

var Map = Proto.clone().newSlots({
    type: "ideal.Map",
    jsMap: null
}).setSlots({
    init: function () {
        this.setJsMap({});
    },

    clear: function () {
        this.setJsMap({});
        return this
    },

    withJsMap: function (jsMap) {
        return this.clone().setJsMap(jsMap)
    },

    keys: function () {
        return Object.keys(this.jsMap());
    },

    values: function () {
        var self = this;
        return this.keys().map(function (k) {
            return self.jsMap()[k];
        });
    },

    at: function (k) {
        return this.jsMap()[k];
    },

    mapAt: function (k) {
        var v = this.at(k);
        if (typeof (v) !== "object" || (Object.getPrototypeOf(v) != Object.prototype)) {
            return v;
        }
        else {
            return map(v);
        }
    },

    atPut: function (k, v) {
        this.jsMap()[k] = v;
        return this;
    },

    atIfAbsentPut: function (k, v) {
        if (!this.hasKey(k)) {
            this.atPut(k, v);
        }
        return this;
    },

    valuesSortedByKeys: function () {
        var self = this;
        return this.keys().sort().map(function (k) {
            return self.at(k);
        });
    },

    forEach: function (fn) {
        var self = this;
        this.keys().forEach(function (k) {
            fn(k, self._jsMap[k]);
        });

        return this;
    },

    map: function (fn) {
        var jsMap = this.jsMap();
        return this.keys().map(function (k) {
            return fn(k, jsMap[k]);
        });
    },

    filtered: function (fn) {
        var map = Map.clone();
        var jsMap = this.jsMap();
        this.keys().forEach(function (k) {
            var v = jsMap[k];
            if (fn(k, v)) {
                map.atPut(k, v);
            }
        });
        return map;
    },

    toJSON: function () {
        return JSON.stringify(this.jsMap());
    },

    isEmpty: function () {
        return Object.keys(this.jsMap()).length == 0;
    },

    lowerCased: function () {
        var map = Map.clone();
        this.forEach(function (k, v) {
            map.atPut(k.toLowerCase(), v);
        });
        return map;
    },

    atDeepKey: function (k) {
        return Object_atDeepKey(this.jsMap(), k);
    },

    allAtDeepKey: function (k) {
        return Object_allAtDeepKey(this.jsMap(), k);
    },

    atPath: function (pathList) {
        return Object_atPath(this.jsMap(), pathList);
    },

    merged: function (aMap) {
        return this.copy().merge(aMap);
    },

    copy: function () {
        return map(Object.shallowCopyTo(this.jsMap(), {}));
    },

    merge: function (aMap) {
        var jsMap = this.jsMap();
        aMap.forEach(function (k, v) {
            jsMap[k] = v;
        });
        return this;
    },

    size: function () {
        return this.keys().size();
    },

    hasKey: function (k) {
        return this.jsMap().hasOwnProperty(k);
    },

    atRemove: function (k) {
        var m = this.jsMap();
        delete m[k];
        return this;
    },

    percentDecode: function () {
        var self = this;
        this.forEach(function (k, v) {
            self.atPut(k, decodeURIComponent(v));
        });
        return self;
    },

    queryString: function () {
        return "?" + this.map(function (k, v) {
            if (v) {
                return k + "=" + encodeURIComponent(v);
            }
            else {
                return k;
            }
        }).join("&");
    }
});

ideal.Map = Map


