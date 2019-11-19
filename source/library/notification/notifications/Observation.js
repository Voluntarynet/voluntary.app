"use strict"

/*

    Observation

    An abstraction for a NotificationCenter observation. 
    Holds references to which notification message a given observer is wants
    notifications for. 

*/

window.Observation = class Observation extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            center: null, // NotificationCenter that owns this
            //target: null, // expects uniqueId string for target
            targetId: null, // expects uniqueId string for target
            name: null,
            observer: null,
            isOneShot: false,
        })

        //this.setIsDebugging(true)
    }

    setTargetId (aString) {
        assert(Type.isString(aString))
        this._targetId = aString
        return this
    }

    setTarget (obj) {
        this.setTargetId(obj.typeId())
        return this
    }

    matchesNotification(note) {
        const matchesTarget = (note.senderId() === this.targetId()) || (this.targetId() === null)
        const matchesName = (note.name() === this.name()) || (this.name() === null)
        return matchesTarget && matchesName
    }

    sendNotification(note) {
        if (this.center().isDebugging()) {
            //console.log(this._observer + " received note " + note.name() + " from " + note.sender() )
        }

        const method = this._observer[note.name()]
        if (method) {
            method.apply(this._observer, [note])
        } else {
            if (this.isDebugging()) {
                this.debugLog(" no method found for note name " + note.name())
            }
        }

        if (this.isOneShot()) {
            this.stopWatching()
        }
    }

    isEqual(obs) {
        const sameName = this.name() === obs.name()
        const sameObserver = this.observer() === obs.observer()
        const sameTargetId = this.targetId() === obs.targetId()
        return sameName && sameObserver && sameTargetId
    }

    watch() {
        this.center().addObservation(this)
        return this
    }

    stopWatching() {
        this.center().removeObservation(this)
        return this
    }
}

window.Observation.registerThisClass()
