"use strict"

/*
    GestureManager

    We typically only want one gesture to be active globally.
    GestureManager helps to coordinate which gesture has control.

*/

window.GestureManager = class GestureManager extends ProtoClass {
    
    initPrototype () {
        this.newSlot("activeGesture", null)
        this.newSlot("begunGestures", null)
    }

    init () {
        super.init()
        this.setBegunGestures({})
        return this
    }

    /*
    static shared () {   
        return this.sharedInstanceForClass(GestureManager)
    }
    */

    hasActiveGesture () {
        return this.activeGesture() && this.activeGesture().isActive()
    }

    requestActiveGesture (aGesture) {
        assert(aGesture)
        //this.releaseActiveGestureIfInactive()
        if(aGesture === this.activeGesture()) {
            console.warn("attempt to activeate an already active gesture ", aGesture.typeId())
            return false
        }

        const ag = this.activeGesture()
        if (ag) {
            // allow child views to steal the active gesture
            const childViewIsRequesting = ag.viewTarget().hasSubviewDescendant(aGesture.viewTarget())
            if (childViewIsRequesting) {
                this.acceptGesture(aGesture)
                return true
            }
        }

        if (!ag) {
            this.acceptGesture(aGesture)
            return true
        } else {
            this.rejectGesture(aGesture)
        }

        return false
    }

    acceptGesture (aGesture) { // private method
        aGesture.viewTarget().cancelAllGesturesExcept(aGesture)
        this.cancelBegunGesturesExcept(aGesture)
        this.setActiveGesture(aGesture)
        if (this.isDebugging()) {
            console.log(this.type() + " activating " + aGesture.description())
        }
        return this
    }

    rejectGesture (aGesture) { // private method
        if (this.isDebugging()) {
            console.log(this.type() + " rejecting " + aGesture.description())
            console.log(this.type() + " already active " + this.activeGesture().description())
        }
        return this
    }

    deactivateGesture (aGesture) {
        if (this.activeGesture() === aGesture) {
            this.setActiveGesture(null)
        }
        return this
    }

    addBegunGesture (aGesture) {
        this.begunGestures().atPut(aGesture.typeId(), aGesture)
        return this
    }

    removeBegunGesture (aGesture) {
        delete this.begunGestures().at(aGesture.typeId())
        return this
    }

    cancelAllBegunGestures () {
        Object.values(this.begunGestures()).forEach(g => g.cancel() );
        return this
    }

    cancelBegunGesturesExcept (aGesture) {
        Object.values(this.begunGestures()).forEach((g) => {
            if (g !== aGesture) {
                g.cancel()
            }
        });
        return this
    }
    
}.initThisClass()
