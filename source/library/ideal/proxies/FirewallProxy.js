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

        const isFunction = Type.isFunction(target[propertyName])
        const isProtected = this.protectedMethods().has(propertyName)

        if (isFunction && isProtected) {
            const self = this
            return () => {
                return self.onProtectedMethodCall(propertyName, arguments)
            }
        }

        return Reflect.get(target, propertyName, target);
    },

    selfTest: function() {
        const array = ["a", "b", "c"]
        const ap = array.asImmutable()
        assertThrows(() => ap.atPut(0, "foo"))
        assertThrows(() => ap[0] = "bar")
        assertThrows(() => ap.pop())
        assertThrows(() => ap.reverse())
        assertThrows(() => ap.shift())
        assertThrows(() => ap.sort())

        const set = new Set(["foo", "bar"])
        const sp = set.asImmutable()
        assertThrows(() => sp.add(1))
        assertThrows(() => sp.clear())
        assertThrows(() => sp.delete("foo"))

        const map = new Map([ ["foo", 1], ["bar", 2] ])
        const mp = set.asImmutable()
        assertThrows(() => mp.clear())
        assertThrows(() => mp.delete("foo"))
        assertThrows(() => mp.set("foo", 2))


        console.log(this.type() + " - self test passed")
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

Object.defineSlots(Object.prototype, {

    asImmutable: function() {
        const obj = FirewallProxy.newProxyFor(this)
        obj.observable().setProtectedMethods(this.mutatorMethodNamesSet())
        return obj
    }

})


FirewallProxy.selfTest()
