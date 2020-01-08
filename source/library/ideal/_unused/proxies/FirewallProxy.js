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

window.FirewallProxy = class FirewallProxy extends ObservableProxy {
    
    initPrototype () {
        this.newSlot("protectedTraps", null).setComment("a Set")
        this.newSlot("protectedMethods", null).setComment("a Set")
    }

    init () {
        super.init()
        this.setProtectedTraps(this.defaultProtectedTraps().shallowCopy())
        this.setProtectedMethods(this.defaultProtectedMethods().shallowCopy())
        this.setIsDebugging(true)
        return this
    }

    defaultProtectedTraps () {
        return new Set([
            "defineProperty", // Object.defineProperty
            "deleteProperty", // Object.deleteProperty
            "preventExtensions", //  Reflect.preventExtensions(target);
            "set", // obj.x = y or obj[x] = y
            "setPrototypeOf", // Reflect.setPrototypeOf()
        ])
    }

    defaultProtectedMethods () {
        return new Set([
        ])
    }

    // need to hook GET so we return special functions to hook protected method calls


    postForTrap (trapName, propertyName) {
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
    }

    onProtectedMethodCall (propertyName, argsList) {
        const msg = " blocked method call '" + propertyName + "' "
        this.debugLog(msg)
        throw new Error(this.typeId() + msg)
    }

    get (target, propertyName) {
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
    }

    selfTest () {
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
    }
}.initThisClass()


// ------------------------------------------------------------------
// Use FirewallProxy to implement asReadOnly methods on basic types
// ------------------------------------------------------------------

Object.defineSlots(Object.prototype, {
    
    mutatorMethodNamesSet () {
        return new Set([
            "__defineGetter__",  
            "__defineSetter__",
        ])
    }

})

Object.defineSlots(Set.prototype, {
    
    mutatorMethodNamesSet () {
        return new Set([
            "add",
            "clear",
            "delete"
        ])
    }

})

Object.defineSlots(Map.prototype, {

    mutatorMethodNamesSet () {
        return new Set([
            "clear",
            "delete",
            "set",
        ])
    }

})

Object.defineSlots(Array.prototype, {

    mutatorMethodNamesSet () {
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
    }

})

Object.defineSlots(Date.prototype, {
    
    mutatorMethodNamesSet () {
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
    }

})

Object.defineSlots(Object.prototype, {

    asReadOnly () {
        const obj = FirewallProxy.newProxyFor(this)
        obj.observable().setProtectedMethods(this.mutatorMethodNamesSet())
        return obj
    }

})


//FirewallProxy.selfTest()
