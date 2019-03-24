"use strict"

/*
    GestureManager

    We typically only want one gesture to be active globally.
    GestureManager helps to coordinate which gesture has control.

*/


window.GestureManager = ideal.Proto.extend().newSlots({
    type: "GestureManager",
    activeGesture: null,
}).setSlots({

    init: function () {
        return this
    },

    shared: function() {   
        return this.sharedInstanceForClass(GestureManager)
    },

    requestActiveGesture: function(aGesture) {
        assert(aGesture)

        this.releaseActiveGestureIfInactive()
        assert(aGesture !== this.activeGesture())

        if (!this.activeGesture()) {
            aGesture.viewTarget().cancelAllGesturesExcept(aGesture)
            this.setActiveGesture(aGesture)
            console.log(this.type() + " activating " + aGesture.typeId())
            return true
        }

        return false
    },

    releaseActiveGestureIfInactive: function() {
        let ag = this.activeGesture()
        if (ag && !ag.isActive()) {
            console.log(this.type() + " releasing " + ag.typeId())
            this.setActiveGesture(null)
        }
        return this
    },

    deactivateGesture: function(aGesture) {
        this.setActiveGesture(null)
        return this
    },

})
