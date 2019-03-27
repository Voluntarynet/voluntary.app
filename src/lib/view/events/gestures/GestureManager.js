"use strict"

/*
    GestureManager

    We typically only want one gesture to be active globally.
    GestureManager helps to coordinate which gesture has control.

*/


window.GestureManager = ideal.Proto.extend().newSlots({
    type: "GestureManager",
    activeGesture: null,
    isDebugging: false,
}).setSlots({

    init: function () {
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

        this.releaseActiveGestureIfInactive()
        assert(aGesture !== this.activeGesture())


        if (!this.activeGesture()) {
            aGesture.viewTarget().cancelAllGesturesExcept(aGesture)
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

    releaseActiveGestureIfInactive: function() {
        let ag = this.activeGesture()
        if (ag && !ag.isActive()) {
            if (this.isDebugging()) {
                console.log(this.type() + " releasing " + ag.typeId())
            }
            this.setActiveGesture(null)
        }
        return this
    },

    deactivateGesture: function(aGesture) {
        this.setActiveGesture(null)
        return this
    },

})
