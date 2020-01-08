"use strict"

/*

    ObservableProxy

    A class for wrapping a reference in a proxy which can
    send proxy trap notifications to observers.

    WARNING:

    Proxies are ~10x slower that direct getter/setters or wrappers around them,
    so they may not be appropraite for high frequency use objects.

    MOTIVATION:

    The motivation for this class was as an access tripwires for lazy loading of
    persistent objects.

    POTENITAIL USES:

    https://exploringjs.com/es6/ch_proxies.html

    Example:

        const myObject = ["a", "b", "c"]
        const proxyRef = ObservableProxy.newProxyFor(myObject)
        proxyRef.observable().addObserver(myObserver)

        now if we call:

            proxyRef.length

        it will trigger the "get" trap and send an "onGetObserved" message to myObserver.
        
*/


window.ObservableProxy = class ObservableProxy extends ProtoClass {
    
    initPrototype () {
        this.newSlot("observers", null)
        this.newSlot("target", null)
        this.newSlot("revocable", null)
        this.newSlot("trapNames", [
            "apply",
            "construct",
            "defineProperty", // Object.defineProperty
            "deleteProperty", // Object.deleteProperty
            "get", // obj.x or obj[x]
            "getOwnPropertyDescriptor", // Object.getOwnPropertyDescriptor
            "getPrototypeOf", // Object.getPrototypeOf
            "has", // x in obj
            "isExtensible", // Reflect.isExtensible(target)
            "ownKeys", // Reflect.ownKeys(target)
            "preventExtensions", //  Reflect.preventExtensions(target);
            "set", // obj.x = y or obj[x] = y
            "setPrototypeOf", // Reflect.setPrototypeOf()
        ])
        this.newSlot("noteNamesDict", null)
    }

    init () {
        super.init()
        this.setObservers([])
        this.setupNoteNames()
        //this.setIsDebugging(true)
        return this
    }

    newProxyFor (aTarget) {
        const handler = this.thisClass().clone()
        handler.setTarget(aTarget)
        //const proxy = new Proxy(aTarget, handler)
        this.setRevocable(Proxy.revocable(aTarget, handler))
        return this.proxy()
    }

    proxy () {
        return this.revocable().proxy
    }

    revoke () {
        this.postForTrap("revoke", null)
        this._revocable.revoke()
        return this
    }

    setupNoteNames () {
        this._noteNamesDict = {}
        this.trapNames().map((name) => {
            // examples: "onObservedGet", "onObservedSet"
            const noteName = "onObserved" + name.capitalized()
            this._noteNamesDict[name] = noteName
        })
        return this
    }

    addObserver (obs) {
        this.observers().appendIfAbsent(obs)
        return obs
    }

    removeObserver (obs) {
        this.observers().remove(obs)
        return obs
    }

    postForTrap (trapName, propertyName) {
        const noteName = this.noteNamesDict()[trapName]

        this._observers.forEach((obs) => {
            if (obs[noteName]) {
                if (this.isDebugging()) {
                    this.debugLog(" posting " + noteName)
                }
                obs[noteName].apply(obs, [this.target(), propertyName])
            }
        })
        return true
    }

    // --- proxy trap methods ---
    
    /*

    apply (target, thisArg, argumentsList) {
        this.postForTrap("apply", propertyName)
        return target[propertyName].apply(target, argumentsList)
    }

    construct (target) {

    }

    */

    defineProperty (target, propertyName, descriptor) {
        this.postForTrap("defineProperty", propertyName)
        return Object.defineProperty(target, propertyName, descriptor)  
    }

    deleteProperty (target, propertyName) {
        this.postForTrap("deleteProperty", propertyName)
        return delete target[propertyName];
    }

    get (target, propertyName) {
        if (propertyName === "observable") {
            const self = this
            return () => { return self }
        }

        /*
        const proxyMethods = { "methodName": true }
        if (proxyMethods.hasOwnProperty(propertyName)) {
            let self = this
            return () => {
                return self[propertyName].apply(self, arguments)
            }
        }
        */

        this.postForTrap("get", propertyName)
        return Reflect.get(target, propertyName, target);
    }

    getOwnPropertyDescriptor (target, propertyName) {
        this.postForTrap("getOwnPropertyDescriptor", propertyName)
        return Object.getOwnPropertyDescriptor(target, propertyName)
    }

    getPrototypeOf (target) {
        this.postForTrap("getPrototypeOf", null)
        return Object.getPrototypeOf(target)
    }

    isExtensible (target, propertyName) {
        this.postForTrap("isExtensible", propertyName)
        return Reflect.isExtensible(target)
    }

    has (target, propertyName) {
        this.postForTrap("has", propertyName)
        return Reflect.has( target, propertyName );
    }

    ownKeys (target, propertyName) {
        this.postForTrap("ownKeys", propertyName)
        return Reflect.ownKeys(target)
    }

    preventExtensions (target, propertyName) {
        this.postForTrap("preventExtensions", propertyName)
        return Reflect.preventExtensions(target);
    }

    set (target, propertyName, newValue) {
        this.postForTrap("set", propertyName)
        return Reflect.set(target, propertyName, newValue);
    }

    setPrototypeOf (target, prototype) {
        this.postForTrap("setPrototypeOf", null)
        return Object.setPrototypeOf(target, prototype)  
    }

    // ---------------

    selfTest () {
        const resultsDict = {}

        const noteNamesDict = ObservableProxy.clone().noteNamesDict()
        
        assert("need to fix this to assign to method name")
        const eventMethod = (target, propertyName) => { 
            resultsDict[propertyName] = true 
            console.log("got note " + propertyName)
        }

        const testObserver = {}

        Object.values(noteNamesDict).forEach((name) => { 
            testObserver[name] = eventMethod
        })

    
        const testArray = ["a", "b", "c"]
        const arrayProxy = ObservableProxy.newProxyFor(testArray)
        arrayProxy.observable().addObserver(testObserver)
    
        const length = arrayProxy.length // get
        arrayProxy[0] = 1 // set
        const v = arrayProxy[0] // get
        1 in arrayProxy // has
    
        Reflect.ownKeys(arrayProxy)
        Object.getOwnPropertyDescriptor(arrayProxy, "clone")
        delete arrayProxy[0]
        //new arrayProxy
        arrayProxy.observable().revoke()

        try {
            arrayProxy.length
        } catch(e) {
            console.log("proxy properly revoked")
        }

        return true
    }

}.initThisClass()

//ObservableProxy.selfTest()