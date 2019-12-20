"use strict"

/*

    HookedSet

    A subclass of Set that maintains that hooks the base mutation methods.

    For this to work, you need to use method alternatives to the non-method
    (operator) operations.

*/

window.HookedSet = class HookedSet extends Set {

    static initThisClass () {
        this.prototype.initPrototype.apply(this.prototype)
        return this
    }

    initPrototype () {
        this.setupMutatorHooks()
    }

    // ------------------------------

    mutatorMethodNamesSet () {
        return new Set([
            "add",
            "clear",
            "delete"
        ])
    }

    static selfTest () {
        const a = this.clone()
        
        let gotWillMutate = false
        let gotDidMutate = false

        a.willMutate = () => {
            gotWillMutate = true
        }
        a.didMutate = () => {
            gotDidMutate = true
        }

        a.add("b")
        assert(gotWillMutate)
        assert(gotDidMutate)

        console.log(this.type() + " - passed self test")
        return this
    }

}.initThisClass() //.selfTest()

