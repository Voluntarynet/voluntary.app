"use strict"

/*

    FirewallProxy

    IMPORTANT: THIS IS UNTESTED AND STILL UNDER CONSTRUCTION

    Usefull for passing references to objects but limiting
    how it can be access e.g. which methods can be called on it.

    An example usecase would be an immutable proxy for an array.
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

    /*
    newProxyFor: function(aTarget) {
        const handler = ObservableProxy.clone()
        handler.setTarget(aTarget)
        //const proxy = new Proxy(aTarget, handler)
        this.setRevocable(Proxy.revocable(aTarget, handler))
        return this.proxy()
    },
    */

    // need to hook GET so we return special functions to hook protected method calls

    init: function() {
        ObservableProxy.init.apply(this)
        this.setProtectedTraps(this.defaultProtectedTraps().shallowCopy())
        this.setProtectedMethods(this.defaultProtectedMethods().shallowCopy())
        return this
    },

    postForTrap: function(trapName, propertyName) {
        if (this.protectedTraps().has(trapName)) {
            throw new Error(this.typeId() + " blocked proxy trap " + trapName + " on property " + propertyName)
            return false
        }

        return true
    },

    onProtectedMethodCall: function(propertyName, argsList) {
        throw new Error(this.typeId() + " blocked method call " + propertyName + " ")
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
        const arrayFwProxy = FirewallProxy.newProxyFor(array)
        arrayFwProxy.observable().setProtectedMethods(new Set(["atPut"]))
        //arrayFwProxy.observable().setProtectedTraps(new Set([...]))
        arrayFwProxy.atPut("a", "foo")
    },
})

FirewallProxy.selfTest()