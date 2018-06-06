/*
-     transition: width 2s linear 1s, height 2s ease 1s; 1st time is duration, 2nd time is delay
*/

"use strict"

window.DivTransitions = class DivTransitions extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            properties: null,
            divView: null,
        })
        this.setProperties({})
    }

    at(aName) {
        var d = this.properties()
        if (!(name in d)) {
            d[name] = DivTransition.clone().setTransitions(this)
        }
        return d[name]
    }

    propertiesAsList() {
        return Object.values(this.properties())
    }

    asString(aString) {
        return this.propertiesAsList().map((t) => { return t.asString() }).join(", ")
    }

    syncToDiv() {
        this.divView().setTransition(this.asString())
        return this
    }

    syncFromDiv() {
        this.setProperties({})

        var s = this.divView().transition()
        var transitionStrings = s.split(",")

        transitionStrings.forEach((tString) => {
            var t = DivTransition.clone().setFromString(tString)
            this.properties()[t.property()] = t
        })

        return this
    }
}

DivTransitions.registerThisClass()

