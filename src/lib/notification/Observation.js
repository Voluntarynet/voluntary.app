"use strict"

/*

    Observation

*/

window.Observation = class Observation extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            target: null, // expects uniqueId string for target
            name: null,
            observer: null,
            center: null, // NotificationCenter that owns this
            debug: false,
        })
    }

    matchesNotification(note) {
        let matchesTarget = (note.sender() === this.target()) || (this.target() === null)
        let matchesName = (note.name() === this.name()) || (this.name() === null)
        return matchesTarget && matchesName
    }

    sendNotification(note) {
        if (this.center().isDebugging()) {
            //console.log(this._observer + " received note " + note.name() + " from " + note.sender() )
        }
        let method = this._observer[note.name()]
        if (method) {
            method.apply(this._observer, [note])
        } else {
            if (this.debug()) {
                console.log(this.typeId() + " no method found for note name " + note.name())
            }
        }
    }

    isEqual(obs) {
        let sameName = this.name() === obs.name()
        let sameObserver = this.observer() === obs.observer()
        let sameTarget = this.target() === obs.target()
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
