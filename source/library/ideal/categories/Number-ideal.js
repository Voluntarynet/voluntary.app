"use strict"

/*

    Number-ideal

    Some extra methods for the Javascript Number primitive.

*/


const Base64 = (function () {
    var digitsStr = 
    //   0       8       16      24      32      40      48      56     63
    //   v       v       v       v       v       v       v       v      v
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-";
    var digits = digitsStr.split("");
    var digitsMap = {};
    for (var i = 0; i < digits.length; i++) {
        digitsMap[digits[i]] = i;
    }
    return {
        fromInt: function(int32) {
            var result = "";
            while (true) {
                result = digits[int32 & 0x3f] + result;
                int32 >>>= 6;
                if (int32 === 0)
                    break;
            }
            return result;
        },
        toInt: function(digitsStr) {
            var result = 0;
            var digits = digitsStr.split("");
            for (var i = 0; i < digits.length; i++) {
                result = (result << 6) + digitsMap[digits[i]];
            }
            return result;
        }
    };
})();

Object.defineSlots(Number.prototype, {

    duplicate: function() {
        return this
    },
    
    copy: function() {
        return this
    },

    shallowCopy: function() {
        return this
    },

    repeat: function (callback) {
        for (let i = 0; i < this; i++) {
            if (callback(i) === false) {
                return this;
            }
        }
        return this;
    },

    map: function () {
        const a = [];
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
        
        if (j === 1 && k !== 11) {
            return "st";
        }
        if (j === 2 && k !== 12) {
            return "nd";
        }
        if (j === 3 && k !== 13) {
            return "rd";
        }
        return "th";
    },

    toBase64: function() {
        return Base64.fromInt(this)
    },

    fromBase64: function(base64String) {
        // need to call like: 
        // Number.prototype.fromBase64("...")
        return Base64.toInt(base64String)
    },
    
});
