"use strict"

/*

    Broadcaster

    Fast notifications that immediately message listeners 
    instead of using Observer and Notification objects.
    As mltiple notifications of the same name are not merged
    within the same event loop, so listeners should implement handlers efficiently.

    Example use:

        // inside a storable node
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

        // inside a persistent store
        didChangeStoredSlot (aSender) {
            ... tell store to persist it ...
        }

    Example use:
*/

window.Broadcaster = class Broadcaster extends ProtoClass {
    initPrototype () {
        this.newSlot("nameToListenerSet", null)  // dict to set
    }

    init() {
        super.init()
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
                n2l.delete(name)
            }
        })
    }

}.initThisClass()

Object.defineSlots(ProtoClass.prototype, {

    broadcastMessage: function(methodName) {
        window.Broadcaster.shared().broadcastEventName(methodName, this)
        return this
    }
    
})
