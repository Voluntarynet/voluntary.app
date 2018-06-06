
"use strict"

window.DivTransition = class DivTransition extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            property: "",
            duration: 0,
            timingFunction: "ease-in-ease-out",
            delay: 0, // set to number type (unit = seconds)
            //parent: null,
            transitions: null,
        })
    }

    durationString() {
        var v = this.duration()
        if (typeof (v) == "number") {
            return v + "s"
        }
        return v
    }

    delayString() {
        var v = this.duration()
        if (typeof (v) == "number") {
            return v + "s"
        }
        return v
    }

    asString(aString) {
        var parts = [
            this.property(),
            this.durationString(),
            this.timingFunction(),
            this.delayString(),
        ]

        return parts.join(" ")
    }

    setFromString(aString) {
        var parts = aString.split(" ").select((part) => { return part != "" })

        var v = parts.removeFirst()
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

    syncToDiv() {
        this.transitions().syncToDiv()
        return this
    }
}

DivTransition.registerThisClass()

