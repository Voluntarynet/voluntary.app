"use strict"

/*

    HookedArray

    A subclass of Array that maintains that hooks the base getters and setters.

    For this to work, you need to use method alternative to the non-method
    array operations:
    
        a[i] -> instead use a.at(i) 
        a[i] = b -> instead use a.atPut(i, b)
        delete a[i] -> instead use a.removeAt(i)
    
    
    Example use:


*/

window.HookedArray = class HookedArray extends Array {

    static initThisClass () {
        this.prototype.initPrototype.apply(this.prototype)
        return this
    }

    initPrototype () {
        this.setupMutatorHooks()
    }

    init () {
        super.init()
        Object.defineSlot(this, "_observers", new Set()) 
    }

    // ------------------------------

    getterMethodNames () {
        // this doesn't cover operators, such as comparison
        const allNames = Object.getOwnPropertyNames(Array.prototype)
        const mutatorNames = mutatorMethodNames
        const getterNames = allNames.filter(name => !mutatorNames.contains(name))
        return getterNames
    }

    mutatorMethodNames () {
        // we can't hook []= or delete[] but we can hook these
        return [
            "push",
            "reverse",
            "shift",
            "sort",
            "splice",
            "unshift"
        ]
    }
    
    setupMutatorHooks () {
        this.mutatorMethodNames().forEach((slotName) => {
            const unhookedName = "unhooked_" + slotName
            const unhookedFunction = this[slotName]

            Object.defineSlot(this, unhookedName, unhookedFunction)

            const hookedFunction = function() {
                this.willMutate(slotName)
                const result = this[unhookedName].apply(this, arguments)
                this.didMutate(slotName)

                /*
                let argsString = []
                for (let i=0; i < arguments.length; i++) {
                    if (i !== 0) { argsString += ", " }
                    argsString += String(arguments[i])
                }
                console.log("hooked Array " + slotName + "(" + argsString + ")") 
                console.log("result = " + result)
                */

                return result
            }

            Object.defineSlot(this, slotName, hookedFunction)
        })
    }

    // ------------------------------

    observers () {
        return this._observers
    }

    addObserver (anObserver) {
        this.observers().add(anObserver)
        return this
    }

    removeObserver (anObserver) {
        this.observers().delete(anObserver)
        return this
    }

    // ------------------------------

    willMutate () {
        //this.observers().forEach(v => v.onWillMutate(this))
    }

    didMutate () {
        this.observers().forEach(v => v.onDidMutate(this))
    }

    // ------------------------------

    static selfTest () {
        const a = this.clone()
        let gotNotification = false
        a.willMutate = () => {
            gotNotification = true
        }
        a.push("b")
        assert(gotNotification)
        return this
    }

}.initThisClass() //.selfTest()

