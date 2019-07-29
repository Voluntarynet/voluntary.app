"use strict"

/*
    GestureManager

    We typically only want one gesture to be active globally.
    GestureManager helps to coordinate which gesture has control.

*/


ideal.Proto.newSubclassNamed("GestureManager").newSlots({
    activeGesture: null,
    isDebugging: false,
    begunGestures: null,
}).setSlots({

    init: function () {
        this.setBegunGestures({})
        return this
    },

    shared: function() {   
        return this.sharedInstanceForClass(GestureManager)
    },

    hasActiveGesture: function() {
        return this.activeGesture() && this.activeGesture().isActive()
    },

    requestActiveGesture: function(aGesture) {
        assert(aGesture)
        //this.releaseActiveGestureIfInactive()
        if(aGesture == this.activeGesture()) {
            console.warn("attempt to activeate an already active gesture ", aGesture.typeId())
            return false
        }

        if (!this.activeGesture()) {
            aGesture.viewTarget().cancelAllGesturesExcept(aGesture)
            this.cancelBegunGesturesExcept(aGesture)
            this.setActiveGesture(aGesture)
            if (this.isDebugging()) {
                console.log(this.type() + " activating " + aGesture.description())
            }
            return true
        } else {
            if (this.isDebugging()) {
                console.log(this.type() + " rejecting " + aGesture.description())
                console.log(this.type() + " already active " + this.activeGesture().description())
            }
        }

        return false
    },

    deactivateGesture: function(aGesture) {
        if (this.activeGesture() === aGesture) {
            this.setActiveGesture(null)
        }
        return this
    },

    addBegunGesture: function(aGesture) {
        this.begunGestures()[aGesture.typeId()] = aGesture
        return this
    },

    removeBegunGesture: function(aGesture) {
        delete this.begunGestures()[aGesture.typeId()]
        return this
    },

    cancelAllBegunGestures: function() {
        Object.values(this.begunGestures()).forEach(g => g.cancel() );
        return this
    },

    cancelBegunGesturesExcept: function(aGesture) {
        Object.values(this.begunGestures()).forEach((g) => {
            if (g !== aGesture) {
                g.cancel()
            }
        });
        return this
    },
})
