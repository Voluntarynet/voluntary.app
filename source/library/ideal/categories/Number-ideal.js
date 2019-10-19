"use strict"

/*

    Number-ideal

    Some extra methods for the Javascript Number primitive.

*/

Object.shallowCopyTo({

    repeat: function (callback) {
        for (let i = 0; i < this; i++) {
            if (callback(i) === false) {
                return this;
            }
        }
        return this;
    },

    map: function () {
        let a = [];
        for (let i = 0; i < this; i++) {
            a.push(i);
        }
        return Array.prototype.map.apply(a, arguments);
    },

    isEven: function () {
        return this % 2 === 0;
    },

    isOdd: function () {
        return this % 2 !== 0;
    },

    ordinalSuffix: function() {
        const i = this
        let j = i % 10
        let k = i % 100
        
        if (j == 1 && k != 11) {
            return "st";
        }
        if (j == 2 && k != 12) {
            return "nd";
        }
        if (j == 3 && k != 13) {
            return "rd";
        }
        return "th";

    }
    
}, Number.prototype);
