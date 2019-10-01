
"use strict"

/*

    DomTransition
         

*/

window.DomTransition = class DomTransition extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            property: "",
            duration: 0,
            timingFunction: "ease-in-out", // "linear", "ease", "ease-in", cubic-bezier(n, n, n, n)
            delay: 0, // set to number type (unit = seconds)
            //parent: null,
            transitions: null,
        })
    }

    updateDuration(s) {
        if (Type.isNumber(s)) {
            s = s + "s"
        }
        this.setDuration(s)
        this.syncToDomView()
        return this
    }

    updateDelay(s) {
        this.setDelay(s)
        this.syncToDomView()
        return this
    }

    updateTimingFunction(s) {
        this.setTimingFunction(s)
        this.syncToDomView()
        return this
    }

    durationString() {
        const v = this.duration()
        if (Type.isNumber(v)) {
            return v + "s"
        }
        return v
    }

    delayString() {
        const v = this.delay()
        if (Type.isNumber(v)) {
            return v + "s"
        }
        return v
    }

    asString() {
        const parts = [
            this.property(),
            this.durationString(),
            this.timingFunction(),
            this.delayString(),
        ]

        return parts.join(" ")
    }

    setFromString(aString) {
        const parts = aString.split(" ").select((part) => { return part !== "" })

        let v = parts.removeFirst()
        assert(v != null)
        this.setProperty(v)

        v = parts.removeFirst()
        if (v != null) {
            this.setDuration(v)
        }

        v = parts.removeFirst()
        if (v != null) {
            this.setTimingFunction(v)
        }

        v = parts.removeFirst()
        if (v != null) {
            this.setDelay(v)
        }

        return this
    }

    syncToDomView() {
        this.transitions().syncToDomView()
        return this
    }
}

DomTransition.registerThisClass()

