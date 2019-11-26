"use strict"

/*

    FirewallProxy

    Usefull for passing references to objects but limiting
    how it can be access e.g. which methods can be called on it.

    An example use case would be an immutable proxy for an array.
    So an object that owns the array can share an immutable proxy for it
    that doesn't allow other's to mutate it.
        
    Example:

        const array = ["a", "b", "c"]
        const proxyRef = FirewallProxy.newProxyFor(array)
        proxyRef.observable().setProtectedMethodNames(new Set([...]))
        proxyRef.observable().setProtectedTrapNames(new Set([...]))
        

*/

ObservableProxy.newSubclassNamed("FirewallProxy").newSlots({        
    protectedTraps: null, // Set
    protectedMethods: null, // Set
}).setSlots({

    defaultProtectedTraps: function() {
        return new Set([
            "defineProperty", // Object.defineProperty
            "deleteProperty", // Object.deleteProperty
            "preventExtensions", //  Reflect.preventExtensions(target);
            "set", // obj.x = y or obj[x] = y
            "setPrototypeOf", // Reflect.setPrototypeOf()
        ])
    },

    defaultProtectedMethods: function() {
        return new Set([
        ])
    },

    // need to hook GET so we return special functions to hook protected method calls

    init: function() {
        ObservableProxy.init.apply(this)
        this.setProtectedTraps(this.defaultProtectedTraps().shallowCopy())
        this.setProtectedMethods(this.defaultProtectedMethods().shallowCopy())
        this.setIsDebugging(true)
        return this
    },

    postForTrap: function(trapName, propertyName) {
        // instead of posting to observers, 
        // just check if it's a protected trap and, if so, raise an exception
        // TODO: abstract non posting behavior from ObservableProxy and 
        // use as parent class of both ObservableProxy and Firewall
        if (this.protectedTraps().has(trapName)) {
            const msg = " blocked proxy trap '" + trapName + "' on property '" + propertyName + "'"
            this.debugLog(msg)
            throw new Error(this.typeId() + msg)
            return false
        }

        return true
    },

    onProtectedMethodCall: function(propertyName, argsList) {
        const msg = " blocked method call '" + propertyName + "' "
        this.debugLog(msg)
        throw new Error(this.typeId() + msg)
    },

    get: function(target, propertyName) {
        if (propertyName === "observable") {
            const self = this
            return () => { return self }
        }

        this.postForTrap("get", propertyName)

        // if it's a protected method, we'll return a special function
        // that calls onProtectedMethodCall to raise an exception
        const isProtected = this.protectedMethods().has(propertyName)
        if (isProtected) {
            const isFunction = Type.isFunction(target[propertyName])
            if (isFunction) {
                const self = this
                return () => {
                    return self.onProtectedMethodCall(propertyName, arguments)
                }
            }
        }

        return Reflect.get(target, propertyName, target);
    },

    selfTest: function() {
        // test array
        const array = ["a", "b", "c"]
        const ap = array.asReadOnly()
        assertThrows(() => ap.atPut(0, "foo"))
        assertThrows(() => ap[0] = "bar")
        assertThrows(() => ap.pop())
        assertThrows(() => ap.reverse())
        assertThrows(() => ap.shift())
        assertThrows(() => ap.sort())

        // test set
        const set = new Set(["foo", "bar"])
        const sp = set.asReadOnly()
        assertThrows(() => sp.add(1))
        assertThrows(() => sp.clear())
        assertThrows(() => sp.delete("foo"))

        // test map
        const map = new Map([ ["foo", 1], ["bar", 2] ])
        const mp = set.asReadOnly()
        assertThrows(() => mp.clear())
        assertThrows(() => mp.delete("foo"))
        assertThrows(() => mp.set("foo", 2))

        // test date
        const date = new Date()
        const dp = date.asReadOnly()
        assertThrows(() => dp.setYear(1999))

        console.log(this.type() + " - self test passed")
    },
}).initThisProto()


// ------------------------------------------------------------------
// Use FirewallProxy to implement asReadOnly methods on basic types
// ------------------------------------------------------------------

Object.defineSlots(Object.prototype, {
    
    mutatorMethodNamesSet: function() {
        return new Set([
            "__defineGetter__",  
            "__defineSetter__",
        ])
    },

})

Object.defineSlots(Set.prototype, {
    
    mutatorMethodNamesSet: function() {
        return new Set([
            "add",
            "clear",
            "delete"
        ])
    },

})

Object.defineSlots(Map.prototype, {

    mutatorMethodNamesSet: function() {
        return new Set([
            "clear",
            "delete",
            "set",
        ])
    },

})

Object.defineSlots(Array.prototype, {

    mutatorMethodNamesSet: function() {
        return new Set([
            "copyWithin",
            "pop",
            "push",
            "reverse",
            "shift",
            "sort",
            "splice",
            "unshift"
        ])
    },

})

Object.defineSlots(Date.prototype, {
    
    mutatorMethodNamesSet: function() {
        return new Set([
            "setDate",
            "setFullYear",
            "setHours",
            "setMilliseconds",
            "setMinutes",
            "setMonth",
            "setSeconds",
            "setTime",
            "setUTCDate",
            "setUTCFullYear",
            "setUTCHours",
            "setUTCMilliseconds",
            "setUTCMinutes",
            "setUTCMonth",
            "setUTCSeconds",
            "setYear",
        ])
    },

})

Object.defineSlots(Object.prototype, {

    asReadOnly: function() {
        const obj = FirewallProxy.newProxyFor(this)
        obj.observable().setProtectedMethods(this.mutatorMethodNamesSet())
        return obj
    },

})


//FirewallProxy.selfTest()
