"use strict"

/*

    Type-ideal

    Value/reference type related functions.

    Example use:

    if (Type.isNullOrUndefined(value)) { ...}

*/

window.Type = {

    isArray: function(value) {
        return !Type.isNull(value) && Type.isObject(value) && value.__proto__ === [].__proto__
    },   

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

    description: function(value) {
        if (this.isArray(value)) { return "Array" }
        if (this.isBoolean(value)) { return "Boolean" }
        if (this.isFunction(value)) { return "Function" }
        if (this.isUndefined(value)) { return "Undefined" }
        if (this.isNull(value)) { return "Null" }
        if (this.isNumber(value)) { return "Number" }
        if (this.isObject(value)) { return "Object" }
        if (this.isString(value)) { return "String" }
        if (this.isSymbol(value)) { return "Symbol" }
        throw new Error("unable to identify type for value: ", value)
        return "?"
    }

}

