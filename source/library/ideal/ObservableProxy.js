"use strict"

/*

    ObservableProxyHandler

    A class for wrapping a reference in a proxy which can
    send proxy trap notifications to observers.

    Example:

        const myObject = ["a", "b", "c"]
        const proxyRef = ObservableProxyHandler.newProxyFor(myObject)
        proxyRef.observable().addObserver(myObserver)

        now if we call:

            proxyRef.length

        it will trigger the "get" trap and send an onGetObserved message to myObserver.
        
*/


ideal.Proto.newSubclassNamed("ObservableProxyHandler").newSlots({        
    observers: null,
    target: null,
    recovable: null,
    trapNames: [
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
    ],
    noteNamesDict: null,
}).setSlots({

    newProxyFor: function(aTarget) {
        const handler = ObservableProxyHandler.clone()
        handler.setTarget(aTarget)
        //const proxy = new Proxy(aTarget, handler)
        this.setRevocable(Proxy.revocable(aTarget, handler))
        return this.proxy()
    },

    proxy: function() {
        return this.revocable().proxy
    },

    init: function() {
        ideal.Proto.init.apply(this)
        this.setObservers([])
        this.setupNoteNames()
        //this.setIsDebugging(true)
        return this
    },

    revoke: function() {
        this._revocable.revoke()
        //this.postForTrap("revoke", propertyName)
        return this
    },

    setupNoteNames: function() {
        this._noteNamesDict = {}
        this.trapNames().map((name) => {
            //examples: "onObservedGet", "onObservedSet"
            const noteName = "onObserved" + name.capitalized()
            this._noteNamesDict[name] = noteName
        })
        return this
    },

    setTarget: function(anObject) {
        anObject._observableProxyHandler = this
        return this
    },

    addObserver: function(obs) {
        this.observers().appendIfAbsent(obs)
        return obs
    },

    removeObserver: function(obs) {
        this.observers().remove(obs)
        return obs
    },

    postForTrap: function(trapName, propertyName) {
        const noteName = this.noteNamesDict()[trapName]

        this._observers.forEach((obs) => {
            if (obs[noteName]) {
                if (this.isDebugging()) {
                    console.log(this.typeId() + " posting " + noteName)
                }
                obs[noteName].apply(obs, [this.target(), propertyName])
            }
        })
        return this
    },

    // special methods
    
    get: function(target, propertyName) {

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
    },

    set: function(target, propertyName, newValue) {
        this.postForTrap("set", propertyName)
        return Reflect.set(target, propertyName, newValue);
    },

    has: function(target, propertyName) {
        this.postForTrap("has", propertyName)
        return Reflect.has( target, propertyName );
    },

    ownKeys: function(target, propertyName) {
        this.postForTrap("ownKeys", propertyName)
        return Reflect.ownKeys(target)
    },

    /*
    setPrototypeOf: function(target) {
        return Reflect.setPrototypeOf(target) ?
    },
    */

    deleteProperty: function(target, propertyName) {
        this.postForTrap("deleteProperty", propertyName)
        return delete target[propertyName];
    },

    getOwnPropertyDescriptor: function(target, propertyName) {
        this.postForTrap("getOwnPropertyDescriptor", propertyName)
        return Object.getOwnPropertyDescriptor(target, propertyName)
    },

    isExtensible: function(target, propertyName) {
        this.postForTrap("isExtensible", propertyName)
        return Reflect.isExtensible(target)
    },

    preventExtensions: function(target, propertyName) {
        this.postForTrap("preventExtensions", propertyName)
        return Reflect.preventExtensions(target);
    },


    // ---------------

    test: function() {
        const testObserver = {
            onObservedGet: function(target, propertyName) { console.log("onObservedGet " + propertyName) },
            onObservedSet: function(target, propertyName) { console.log("onObservedSet " + propertyName) },
            onObservedHas: function(target, propertyName) { console.log("onObservedHas " + propertyName) }
        } 
    
        const testArray = ["a", "b", "c"]
        const arrayProxy = ObservableProxyHandler.newProxyFor(testArray)
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

})


ObservableProxyHandler.test()