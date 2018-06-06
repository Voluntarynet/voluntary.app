"use strict"

window.Observation = class Observation extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            target: null, // expects uniqueId string for target
            name: null,
            observer: null,
            center: null,
            debug: false,
        })
    }

    matchesNotification(note) {
        var matchesTarget = (note.sender() == this.target()) || (this.target() == null)
        var matchesName = (note.name() == this.name()) || (this.name() === null)
        return matchesTarget && matchesName
    }

    sendNotification(note) {
        if (this.center().isDebugging()) {
            //console.log(this._observer + " received note " + note.name() + " from " + note.sender() )
        }
        var method = this._observer[note.name()]
        if (method) {
            method.apply(this._observer, [note])
        } else {
            if (this.debug()) {
                console.log(this.type() + " no method found for note name " + note.name())
            }
        }
    }

    isEqual(obs) {
        var sameName = this.name() == obs.name()
        var sameObserver = this.observer() == obs.observer()
        var sameTarget = this.target() == obs.target()
        return sameName && sameObserver && sameTarget
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
