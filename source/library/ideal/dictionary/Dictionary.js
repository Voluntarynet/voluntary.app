"use strict"

/*

    Dictionary

    A wrapper for a Javascript dictionary/object.
    We can use this to ensure all dictionary methods are hooked.


*/

window.ideal.Dictionary = class Dictionary extends ProtoClass {
    static withJsDict (jsDict) {
        return this.clone().setJsDict(jsDict)
    }

    initPrototype() {
        // don't call super as it's init was called when it was created
        this.newSlot("jsDict", null)
        this.newSlot("mutateClosure", null)
    }

    init () {
        super.init()
        this.clear();
    }

    clear () {
        this.setJsDict({});
        return this
    }

    setJsDict (anObject) {
        this.willMutate()
        assert(Type.isObject(anObject))
        this._jsDict = anObject
        return this
    }

    keys () {
        return Object.keys(this.jsDict());
    }

    values () {
        const dict = this.jsDict()
        return this.keys().map( k => dict[k] )
    }

    at (k) {
        return this.jsDict().getOwnProperty(k)
    }

    /*
    mapAt (k) {
        const v = this.at(k);
        if (typeof(v) !== "object" || (Object.getPrototypeOf(v) !== Object.prototype)) {
            return v;
        }
        else {
            return this.thisClass().withJsDict(v)
        }
    }
    */

    atPut (k, v) {
        const dict = this.jsDict()
        if (dict[k] !== v) {
            this.willMutate()
            dict[k] = v;
        }
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

    ownForEachKV (fn) {
        return this.forEach(fn)
    }

    forEach (fn) {
        const jsDict = this.jsDict();
        this.keys().forEach( k => fn(k, jsDict[k]) )
        return this;
    }

    map (fn) {
        const jsDict = this.jsDict();
        return this.keys().map( k => fn(k, jsDict[k]) )
    }

    /*
    filtered (fn) {
        const map = this.thisClass().clone();
        const jsDict = this.jsDict();
        this.keys().forEach(function (k) {
            const v = jsDict[k];
            if (fn(k, v)) {
                map.atPut(k, v);
            }
        });
        return map;
    }
    */

    asJson () {
        return JSON.stringify(this.jsDict(), null, 2);
    }

    isEmpty () {
        return Object.keys(this.jsDict()).length === 0;
    }

    keySet () {
        return this.keys().asSet()
    }

    isEqual (other) {
        assert(other.isKindOf(Dictionary)) // protocol check would be better

        const allKeys = this.keySet().union(other.keySet())
        const nonMatchingKey = allKeys.detect(k => this.at(k) !== other.at(k))
        return Type.isNullOrUndefined(nonMatchingKey)
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
        return this.thisClass().withJsDict(Object.assign({}, this.jsDict()));
    }

    merge (other) {
        const jsDict = this.jsDict();
        other.ownForEachKV((k, v) => { this.atPut(k, v) } )
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

    removeAt (k) {
        console.log(this.typeId() + " warning: using removeAt instead of removeKey")
        return this.removeKey(k)
    }

    removeKey (k) {
        this.willMutate()
        delete this.jsDict()[k];
        return this;
    }

    // extra helpers

    totalBytes () {
        let byteCount = 0
        this.jsDict().ownForEachKV((k, v) => {
            byteCount += k.length + v.length
        })
        return byteCount
    }

    willMutate () {
        if (this.mutateClosure()) {
            this.mutateClosure()(this)
        }
    }

}.initThisClass()