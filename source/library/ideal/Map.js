"use strict"

/*

    Map


*/


window.ideal.Map = class Map extends ProtoClass {
    static withJsMap (jsMap) {
        jsMap = jsMap || {}
        return this.clone().setJsMap(jsMap)
    }

    init () {
        this.newSlot("jsMap", null)
        this.setJsMap({});
    }

    clear () {
        this.setJsMap({});
        return this
    }

    keys () {
        return Object.keys(this.jsMap());
    }

    values () {
        return this.keys().map( (k) => {
            return this.jsMap()[k];
        });
    }

    at (k) {
        if (this.hasKey(k)) { // to avoid inheritance
            return this.jsMap()[k];
        }
        return undefined
    }

    mapAt (k) {
        const v = this.at(k);
        if (typeof(v) !== "object" || (Object.getPrototypeOf(v) !== Object.prototype)) {
            return v;
        }
        else {
            return Map.withJsMap(v)
        }
    }

    atPut (k, v) {
        this.jsMap()[k] = v;
        return this;
    }

    atIfAbsentPut (k, v) {
        if (!this.hasKey(k)) {
            this.atPut(k, v);
        }
        return this;
    }

    valuesSortedByKeys () {
        return this.keys().sort().map( (k) => {
            return this.at(k);
        });
    }

    forEach (fn) {
        this.keys().forEach( (k) => {
            fn(k, this._jsMap[k]);
        });

        return this;
    }

    map (fn) {
        let jsMap = this.jsMap();
        return this.keys().map(function (k) {
            return fn(k, jsMap[k]);
        });
    }

    filtered (fn) {
        const map = Map.clone();
        const jsMap = this.jsMap();
        this.keys().forEach(function (k) {
            const v = jsMap[k];
            if (fn(k, v)) {
                map.atPut(k, v);
            }
        });
        return map;
    }

    toJSON () {
        return JSON.stringify(this.jsMap());
    }

    isEmpty () {
        return Object.keys(this.jsMap()).length === 0;
    }

    lowerCased () {
        const map = Map.clone();
        this.forEach(function (k, v) {
            map.atPut(k.toLowerCase(), v);
        });
        return map;
    }

    /*
    atDeepKey (k) {
        return Object.atDeepKey(this.jsMap(), k);
    }

    allAtDeepKey (k) {
        return Object.allAtDeepKey(this.jsMap(), k);
    }
    */

    atPath (pathList) {
        return Object.atPath(this.jsMap(), pathList);
    }

    merged (aMap) {
        return this.shallowCopy().merge(aMap);
    }

    shallowCopy () {
        return Map.withJsMap(Object.assign({}, this.jsMap()));
    }

    merge (aMap) {
        const jsMap = this.jsMap();
        aMap.forEach(function (k, v) {
            jsMap[k] = v;
        });
        return this;
    }

    size () {
        return this.keys().size();
    }

    hasKey (k) {
        return this.jsMap().hasOwnProperty(k);
    }

    removeKey (k) {
        const m = this.jsMap();
        delete m[k];
        return this;
    }

    /*
    percentDecode () {
        this.forEach( (k, v) => {
            this.atPut(k, decodeURIComponent(v));
        });
        return this;
    }

    queryString () {
        return "?" + this.map(function (k, v) {
            if (v) {
                return k + "=" + encodeURIComponent(v);
            }
            else {
                return k;
            }
        }).join("&");
    }
    */
}

window.ideal.Map.registerThisClass()