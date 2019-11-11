"use strict"

/*

    Broadcaster

    High performance notifications that skip using Observer and Notification objects and
    immediately messages listeners. It's up to listeners to efficiently handle this situation.

    Example use:

        // inside a NodeStore
        init () {
            ...
            Broadcaster.shared().addListenerForName(this, "didChangeStoredSlot")
            ...
        }

        // inside a StoreableNode, on slot change
        onSlotChange (...) {
            ...
            Broadcaster.shared().broadcastEventName("didChangeStoredSlot")
            ...
        }

        // inside a NodeStore
        didChangeStoredSlot: function(aSender) {
            this.addDirtyObject(aSender)
        }

    Example use:
*/

window.Broadcaster = class Broadcaster extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            nameToListenerSet: null, // dict to set
        })

        this.setNameToListenerSet({})
    }

    listenerSetForName (name) {
        assert(!Type.isNullOrUndefined(name))

        // probably not inneficient since 
        // 1. we don't remove listeners often
        // 2. we don't have many names
        const n2l = this.nameToListenerSet()

        let listenerSet = n2l[name]
        if (!listenerSet) {
            listenerSet = new Set()
            n2l[name] = listenerSet
        }
        return listenerSet
    }
	
    addListenerForName (aListener, name) {
        this.listenerSetForName(name).add(aListener)
        return this
    }
    
    removeListenerForName (aListener, name) {
        this.listenerSetForName(name).delete(aListener)
        return this
    }

    broadcastNameAndArgument (methodName, anArgument) {
        for (var it = this.listenerSetForName(methodName).values(), v= null; v=it.next().value; ) {
            v[methodName].apply(v, [anArgument])
        }
        return this
    }

    clean () {
        const n2l = this.nameToListenerSet()
        Object.keys(n2l).forEach((name) => {
            const listenerSet = n2l[name]
            if (listenerSet.values().length === 0) {
                delete n2l[name]
            }
        })
    }

}

window.Broadcaster.registerThisClass()

/*
ideal.Proto.broadcastMessage = function(methodName) {
    window.Broadcaster.shared().broadcastEventName(methodName, this)
    return this
}
*/