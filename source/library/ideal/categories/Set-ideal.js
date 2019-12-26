"use strict"

/*

    Set-ideal

    Some extra methods for the Javascript Set primitive.

*/

Object.defineSlots(Set.prototype, {

    shallowCopy: function() {
        return new Set(this.values())
    },

    keysArray: function() {
        return Array.fromIterator(this.values())
    },

    valuesArray: function() {
        return this.keysArray()
    },

    detect: function(fn) {
        // TODO: optimize?
        return this.valuesArray().detect(fn)
    },

    isSuperset: function(subset) {
        for (let v of subset) {
            if (!this.has(v)) {
                return false;
            }
        }
        return true;
    },
    
    union: function(setB) {
        let _union = new Set(this);
        for (let v of setB) {
            _union.add(v);
        }
        return _union;
    },
    
    intersection: function(setB) {
        let _intersection = new Set();
        for (let elem of setB) {
            if (this.has(elem)) {
                _intersection.add(elem);
            }
        }
        return _intersection;
    },
    
    symmetricDifference: function(setB) {
        let _difference = new Set(this);
        for (let v of setB) {
            if (_difference.has(v)) {
                _difference.delete(v);
            } else {
                _difference.add(v);
            }
        }
        return _difference;
    },
    
    difference: function(setB) {
        let _difference = new Set(this);
        for (let v of setB) {
            _difference.delete(v);
        }
        return _difference;
    },

    map: function(func) {
        const result = new Set()
        this.forEach((v) => result.add(func(v)))
        return result
    },

    isEmpty: function(func) {
        return this.size == 0        
    },

    
    /*
    //Examples
    var setA = new Set([1, 2, 3, 4]),
        setB = new Set([2, 3]),
        setC = new Set([3, 4, 5, 6]);
    
    setA.isSuperset(setB); // => true
    setA.union(setC); // => Set [1, 2, 3, 4, 5, 6]
    setA.intersection(setC); // => Set [3, 4]
    setA.symmetricDifference(setC); // => Set [1, 2, 5, 6]
    setA.difference(setC); // => Set [1, 2]
    */
    
});
