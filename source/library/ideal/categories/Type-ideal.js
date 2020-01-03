"use strict"

/*

    Type-ideal

    Value/reference type related functions.

    Example use:

        if (Type.isNullOrUndefined(value)) { ...}


    Known types:

        Literals:

            null
            undefined
            string
            symbol
            number

        Other types:

            object
            array

            Int8Array
            Uint8Array
            Uint8ClampedArray
            Int16Array
            Uint16Array
            Int32Array
            Uint32Array
            Float32Array
            Float64Array
            BigInt64Array
            BigUint64Array


    More example uses:

        const i8a = new Int8Array(6);   
        console.log("is a Int8Array: ", Type.isInt8Array(i8a))

*/

window.Type = {

    allTypeNames: function() {
        return [
            "Undefined",
            "Null",
            "String",
            "Symbol",
            "Number",
            "Map",
            "Set",
            "Array",
            "Int8Array",
            "Uint8Array",
            "Uint8ClampedArray",
            "Int16Array",
            "Uint16Array",
            "Int32Array",
            "Uint32Array",
            "Float32Array",
            "Float64Array",
            "BigInt64Array",
            "BigUint64Array",
            //"TypedArray",
            "Object", // put object last so other types have preference
        ]
    },

    typedArrayTypeNames: function() {
        return [
            "Int8Array",
            "Uint8Array",
            "Uint8ClampedArray",
            "Int16Array",
            "Uint16Array",
            "Int32Array",
            "Uint32Array",
            "Float32Array",
            "Float64Array",
            "BigInt64Array",
            "BigUint64Array",
        ]
    },

    isClass: function(v) {
        const result = typeof(v) === "function"
            && /^class\s/.test(Function.prototype.toString.call(v));

        return result
    },

    isLiteral: function(v) {
        return  Type.isString(v) ||
                Type.isNumber(v) ||
                Type.isBoolean(v) ||
                Type.isNull(v);
    },

    isArray: function(value) {
        return !Type.isNull(value) && 
                Type.isObject(value) && 
                value.__proto__ === ([]).__proto__ &&
                !Type.isUndefined(value.length)
    },

    isSet: function(value) {
        return !Type.isNull(value) && 
            Type.isObject(value) && 
            value.__proto__ === Set.prototype 
    },

    isMap: function(value) {
        return !Type.isNull(value) && 
            Type.isObject(value) && 
            value.__proto__ === Map.prototype 
    },  

    isIterator: function(value) {
        return !Type.isNull(value) && 
                Type.isObject(value) && 
                typeof(value[Symbol.iterator]) === "function";
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
        // WARNING: true for array and dictionary too!
        return typeof(value) === "object" 
    },

    isString: function(value) {
        return typeof(value) === "string"
    }, 

    isSymbol: function(value) {
        return typeof(value) === "symbol"
    }, 

    // typed arrays 

    valueHasConstructor: function(v, constructor) {  // private
        return !Type.isNullOrUndefined(v) && (Object.getPrototypeOf(v) === constructor.prototype);
    },

    isInt8Array: function(v) {
        return Type.valueHasConstructor(v, Int8Array);
    },

    isUint8Array: function(v) {
        return Type.valueHasConstructor(v, Uint8Array);
    },

    isUint8ClampedArray: function(v) {
        return Type.valueHasConstructor(v, Uint8ClampedArray);
    },

    isInt16Array: function(v) {
        return Type.valueHasConstructor(v, Int16Array);
    },

    isUint16Array: function(v) {
        return Type.valueHasConstructor(v, Uint16Array);
    },

    isInt32Array: function(v) {
        return Type.valueHasConstructor(v, Int32Array);
    },

    isUint32Array: function(v) {
        return Type.valueHasConstructor(v, Uint32Array);
    },
    
    isFloat32Array: function(v) {
        return Type.valueHasConstructor(v, Float32Array);
    },

    isFloat64Array: function(v) {
        return Type.valueHasConstructor(v, Float64Array);
    },

    isBigInt64Array: function(v) {
        return Type.valueHasConstructor(v, BigInt64Array);
    },

    isBigUint64Array: function(v) {
        return Type.valueHasConstructor(v, BigUint64Array);
    },

    
    isTypedArray: function(v) {
        return Type.valueHasConstructor(v, TypedArray);
    },
    

    // type name

    typeName: function(value) {
        if (Type.isObject(value)) {
            //return value.type()
            return value.constructor.name
        }

        const typeNames = this.allTypeNames()
        for (let i = 0; i < typeNames.length; i++) {
            const typeName = typeNames[i]
            const methodName = "is" + typeName
            if (this[methodName].apply(this, [value])) {
                return typeName
            }
        }
        throw new Error("unable to identify type for value: ", value)
    },

    typeNamesForValue: function(value) {
        const matches = []
        const typeNames = this.allTypeNames()
        for (let i = 0; i < typeNames.length; i++) {
            const typeName = typeNames[i]
            const methodName = "is" + typeName
            if (this[methodName].apply(this, [value])) {
                matches.push(typeName)
            }
        }
        return matches
    },

    assertValueTypeNames: function(v, validTypeNames) {
        let doesMatch = true
        const foundTypeNames = this.typeNamesForValue(v)
        if (foundTypeNames.length === validTypeNames.length) {
            for (let i = 0; i < foundTypeNames.length; i ++) {
                const name = foundTypeNames[i]
                if (!validTypeNames.includes(name)) {
                    doesMatch = false;
                    break;
                }
            }
        } else {
            doesMatch = false
        }
        if (!doesMatch) {
            throw new Error(JSON.stringify(validTypeNames) + " != " + JSON.stringify(foundTypeNames) )
        }
    },

    test: function() { // private
        this.assertValueTypeNames(null, ["Null", "Object"])
        this.assertValueTypeNames(undefined, ["Undefined"])
        this.assertValueTypeNames("foo", ["String"])
        this.assertValueTypeNames(1, ["Number"])
        this.assertValueTypeNames([], ["Array", "Object"])
        this.assertValueTypeNames({}, ["Object"])
        this.assertValueTypeNames(new Int8Array(), ["Int8Array", "Object"])

        // extras
        //assert(Type.isNullOrUndefined(undefined))
        //assert(Type.isNullOrUndefined(null))
    },

}

//Type.test()