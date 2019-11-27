"use strict"

/*

    Dictionary

    A wrapper for a Javascript dictionary/object.


*/

window.ideal.Dictionary = class Dictionary extends ProtoClass {
    static withJsDict (jsDict) {
        return this.clone().setJsDict(jsDict)
    }

    initPrototype() {
        // don't call super as it's init was called when it was created
        this.newSlot("jsDict", null)
    }

    init () {
        super.init()
        this.setJsDict({});
    }

    clear () {
        this.setJsDict({});
        return this
    }

    keys () {
        return Object.keys(this.jsDict());
    }

    values () {
        return this.keys().map( (k) => {
            return this.jsDict()[k];
        });
    }

    at (k) {
        if (this.hasKey(k)) { // to avoid inheritance
            return this.jsDict()[k];
        }
        return undefined
    }

    /*
    mapAt (k) {
        const v = this.at(k);
        if (typeof(v) !== "object" || (Object.getPrototypeOf(v) !== Object.prototype)) {
            return v;
        }
        else {
            return Map.withJsDict(v)
        }
    }
    */

    atPut (k, v) {
        this.jsDict()[k] = v;
        return this;
    }

    atIfAbsentPut (k, v) {
        if (!this.hasKey(k)) {
            this.atPut(k, v);
        }
        return this;
    }

    /*
    valuesSortedByKeys () {
        return this.keys().sort().map(k =>  this.at(k))
    }
    */

    forEach (fn) {
        this.keys().forEach( (k) => {
            const v = this._jsMap[k]
            fn(k, v);
        });

        return this;
    }

    map (fn) {
        const jsDict = this.jsDict();
        return this.keys().map(function (k) {
            return fn(k, jsDict[k]);
        });
    }

    filtered (fn) {
        const map = Map.clone();
        const jsDict = this.jsDict();
        this.keys().forEach(function (k) {
            const v = jsDict[k];
            if (fn(k, v)) {
                map.atPut(k, v);
            }
        });
        return map;
    }

    asJson () {
        return JSON.stringify(this.jsDict(), null, 2);
    }

    isEmpty () {
        return Object.keys(this.jsDict()).length === 0;
    }

    /*
    atPath (pathList) {
        return Object.atPath(this.jsDict(), pathList);
    }

    merged (aMap) {
        return this.shallowCopy().merge(aMap);
    }
    */

    shallowCopy () {
        return Map.withJsDict(Object.assign({}, this.jsDict()));
    }

    merge (aMap) {
        const jsDict = this.jsDict();
        aMap.forEach(function (k, v) {
            jsDict[k] = v;
        });
        return this;
    }

    size () {
        return this.keys().size();
    }

    /*
    has(k) {
        return this.jsDict().hasOwnProperty(k);
    }
    */

    hasKey (k) {
        return this.jsDict().hasOwnProperty(k);
    }

    removeKey (k) {
        const m = this.jsDict();
        delete m[k];
        return this;
    }
}.initThisClass()