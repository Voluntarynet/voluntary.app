"use strict"

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
        return this % 2 == 0;
    },

    isOdd: function () {
        return this % 2 != 0;
    },
    
}, Number.prototype);
