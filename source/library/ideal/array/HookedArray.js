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

    // ------------------------------

    /*
    nonMutatorMethodNames () {
        // this doesn't cover operators, such as comparison
        const allNames = Object.getOwnPropertyNames(Array.prototype)
        const mutatorNames = mutatorMethodNames
        const getterNames = allNames.filter(name => !mutatorNames.contains(name))
        return getterNames
    }
    */

    mutatorMethodNamesSet () {
        // we can't hook []= or delete[] but we can hook these
        // and use hooked methods instead of operators for those
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
 

    asReadOnlyShalowCopy () {
        const obj = this.thisClass().withArray(this)
        obj.willMutate = () => {
            throw new Error("attempt to mutate a read only array")
        }
        return obj
    }

    // ------------------------------

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
        a.push("b")
        assert(gotWillMutate)
        assert(gotDidMutate)

        const b = a.asReadOnlyShalowCopy()

        let caughtReadOnlyMutate = false
        try {
            b.pop()
        } catch (e) {
            caughtReadOnlyMutate = true
        }
        assert(caughtReadOnlyMutate)

        console.log(this.type() + " - passed self test")
        return this
    }

}.initThisClass() //.selfTest()

