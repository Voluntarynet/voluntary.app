
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
            timingFunction: "ease-in-ease-out",
            delay: 0, // set to number type (unit = seconds)
            //parent: null,
            transitions: null,
        })
    }

    durationString() {
        const v = this.duration()
        if (Type.isNumber(v)) {
            return v + "s"
        }
        return v
    }

    delayString() {
        const v = this.duration()
        if (Type.isNumber(v)) {
            return v + "s"
        }
        return v
    }

    asString(aString) {
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

    syncToDiv() {
        this.transitions().syncToDiv()
        return this
    }
}

DomTransition.registerThisClass()

