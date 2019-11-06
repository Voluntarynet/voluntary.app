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

/*
const exampleHandler = {
    get: function(target, propertyName) {
        return Reflect.get( target, propertyName, target );
    },

    set: function(target, propertyName, newValue) {
        return Reflect.set( target, propertyName, newValue );
    },

    has: function(target, propertyName) {
        return Reflect.has( target, propertyName );
    }
}
*/



ideal.Proto.newSubclassNamed("ObservableProxyHandler").newSlots({        
    observers: null,
    target: null,
    proxy: null,
    trapNames: [
        "apply",
        "construct",
        "defineProperty",
        "deleteProperty",
        "get",
        "getOwnPropertyDescriptor",
        "getPrototypeOf",
        "has",
        "isExtensible",
        "ownKeys",
        "preventExtensions",
        "set",
        "setPrototypeOf",
        "get",
        "set",
    ],
    noteNamesDict: null,
}).setSlots({

    newProxyFor: function(aTarget) {
        const handler = ObservableProxyHandler.clone()
        handler.setTarget(aTarget)

        const proxy = new Proxy(aTarget, handler)
        this.setProxy(proxy)

        return proxy
    },

    init: function() {
        ideal.Proto.init.apply(this)
        this.setObservers([])
        this.setupNoteNames()
        //this.setIsDebugging(true)
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
                obs[noteName].apply(obs, this.target(), propertyName)
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

})


// --------------------

const testObserver = {
    onObservedGet: function() { console.log("onObservedGet") },
    onObservedSet: function() { console.log("onObservedSet") },
    onObservedHas: function() { console.log("onObservedHas") }
} 

const testArray = ["a", "b", "c"]
const arrayProxy = ObservableProxyHandler.newProxyFor(testArray)
arrayProxy.observable().addObserver(testObserver)

const length = arrayProxy.length // get
arrayProxy[0] = 1 // set
const v = arrayProxy[0] // get
1 in arrayProxy // has

