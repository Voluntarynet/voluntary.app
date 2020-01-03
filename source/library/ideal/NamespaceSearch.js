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

class NamespaceSearch {

    matchingPaths () {
        return this._matchingPaths
    }

    setSlotMatchClosure (aClosure) {
        this._slotMatchClosure = aClosure
        return this
    }

    slotMatchClosure () {
        return this._slotMatchClosure
    }

    clear () {
        this._visited = new Set([this]) // to avoid searching this object
        this._matchingPaths = []
    }

    find (searchString) {
        this.clear()

        if (searchString) {
            this.setSlotMatchClosure((slotOwner, slotName, slotValue, slotPath) => {
                return slotName === s
            })
        }

        this.findOnObject(globalThis, ["globalThis"])
        //console.log("this._visited.size = " + this._visited.size)
        return this
    }

    findOnObject (v, path = []) {
        let joinedPath = path.join("/")

        if (Type.isLiteral(v) || Type.isNullOrUndefined(v)) {
            return false
        }

        if (this._visited.has(v)) {
            return false
        } else {
            this._visited.add(v)
        }


        Object.getOwnPropertyNames(v).forEach((k) => {
            if (this.canAccessSlot(v, k)) {
                this.findOnSlot(v, k, path)
            }
        })
    }

    canAccessSlot (v, k) {
        const descriptor = Object.getOwnPropertyDescriptor(v, k)
        if (descriptor.get) {
            return false // to avoid illigal operation error
        }      
        return true 
    }

    findOnSlot (slotOwner, slotName, path = []) {
        let localPath = path.shallowCopy()
        localPath.push(slotName)
        
        //console.log(localPath.join("/"))
        const slotValue = slotOwner[slotName]

        if (this.doesMatchOnSlot(slotOwner, slotName, slotValue, localPath)) {
            this.addMatchingPath(localPath)
            //console.log("found match at" + localPath + "'")
        }

        //console.log(" " + localPath.join("/") + " (" + typeof(slotValue) + ")")
        this.findOnObject(slotValue, localPath)
    }

    addMatchingPath (aPath) {
        const stringPath = aPath.join("/")
        if (!this._matchingPaths.contains(stringPath)) {
            this._matchingPaths.push(stringPath)
        }
        return this
    }

    doesMatchOnSlot (slotOwner, slotName, slotValue, slotPath) {
        return this.slotMatchClosure()(slotOwner, slotName, slotValue, slotPath)
    }

    showMatches () {
        console.log("matchingPaths:")
        this._matchingPaths.forEach(p => console.log(p))
    }

    static selfTest () {
        const search = new this()
        search.setSlotMatchClosure(function (slotOwner, slotName, slotValue, slotPath) {
            return slotName === "String"
        })
        search.find()
        assert(search.matchingPaths()[0] === "globalThis/String")
    }

}

//NamespaceSearch.selfTest()
