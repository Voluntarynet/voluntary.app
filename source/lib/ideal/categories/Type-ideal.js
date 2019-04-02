"use strict"

/*

    Type-ideal

    Value/reference type related functions.

    Example use:

    if (Type.isNullOrUndefined(value)) { ...}

*/

window.Type = {

    isBoolean: function(value) {
        return typeof(value) === "boolean"
    },   

    isFunction: function(value) {
        return typeof(value) === "function"
    },  

    isUndefined: function(value) {
        return value === undefined // safe in modern browsers, even safe in older browsers if undefined is not redefined
    },

    isNull: function(value) {
        return value === null
    },

    isNullOrUndefined: function(value) {
        return this.isUndefined(value) || this.isNull(value)
    },

    isNumber: function(value) {
        return typeof(value) === "number"
    },

    isObject: function(value) {
        return typeof(value) === "object"
    },

    isString: function(value) {
        return typeof(value) === "string"
    }, 

    isSymbol: function(value) {
        return typeof(value) === "symbol"
    }, 

}

