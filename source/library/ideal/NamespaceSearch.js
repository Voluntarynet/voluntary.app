"use strict"

/*

    NamespaceSearch
 
    A way to search the Javascript namespace.
    All slots are enumerated and passed through a user defined closure to find matches.

    Example use:

        const search = new NamespaceSearch()
        search.setSlotMatchClosure(function (slotOwner, slotName, slotValue, slotPath) {
            return slotName === "String"
        })
        search.find()
        assert(search.matchingPaths()[0] === "globalThis/String")

*/

class NamespaceSearch extends ProtoClass {

    init () {
        this.newSlot("visited", null)
        this.newSlot("matchingPaths", null)
        this.newSlot("slotMatchClosure", null)
        this.clear()
    }

    clear () {
        this.setVisited(new Set([this])) // to avoid searching this object
        this.setMatchingPaths([])
    }

    find (searchString) {
        this.clear()

        if (searchString) {
            this.setSlotMatchClosure((slotOwner, slotName, slotValue, slotPath) => {
                return slotName === s
            })
        }

        this.findOnObject(globalThis, ["globalThis"])
        return this
    }

    findOnObject (v, path = []) {
        if (Type.isNullOrUndefined(v)) {
            return false
        }

        if (this._visited.has(v)) {
            return false
        } else {
            this._visited.add(v)
        }

        //const joinedPath = path.join("/")

        Object.getOwnPropertyNames(v).forEach((k) => {
            if (this.canAccessSlot(v, k)) {
                this.findOnSlot(v, k, path)
            }
        })
    }

    canAccessSlot (v, k) {
        // to avoid illegal operation errors
        const descriptor = Object.getOwnPropertyDescriptor(v, k)
        const hasCustomGetter = Type.isUndefined(descriptor.get)
        return !hasCustomGetter
    }

    findOnSlot (slotOwner, slotName, path = []) {
        const localPath = path.shallowCopy()
        localPath.push(slotName)
        
        const slotValue = slotOwner[slotName]

        if (this.doesMatchOnSlot(slotOwner, slotName, slotValue, localPath)) {
            this.addMatchingPath(localPath)
        }

        this.findOnObject(slotValue, localPath)
    }

    doesMatchOnSlot (slotOwner, slotName, slotValue, slotPath) {
        return this.slotMatchClosure()(slotOwner, slotName, slotValue, slotPath)
    }

    addMatchingPath (aPath) {
        const stringPath = aPath.join("/")
        if (!this._matchingPaths.contains(stringPath)) {
            this._matchingPaths.push(stringPath)
        }
        return this
    }

    showMatches () {
        console.log("matchingPaths:")
        this._matchingPaths.forEach(p => console.log("  " + p))
    }

    static selfTest () {
        const ns = NamespaceSearch.clone()
        ns.setSlotMatchClosure(function (slotOwner, slotName, slotValue, slotPath) {
            return slotName === "String"
        })
        ns.find()
        assert(ns.matchingPaths()[0] === "globalThis/String")
    }

}

//NamespaceSearch.selfTest()
