"use strict"

// -----------------------------------------

function map(obj) {
    return Map.withJsMap(obj || {});
}

Map.__map = map;

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
