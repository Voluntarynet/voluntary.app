"use strict"

/*

    DomTransition
         
    transition: width 2s linear 1s, height 2s ease 1s; 1st time is duration, 2nd time is delay

*/


window.DomTransitions = class DomTransitions extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            properties: null,
            domView: null,
        })
        this.setProperties({})
    }

    at(aName) {
        const d = this.properties()
        if (!(name in d)) {
            d[name] = DomTransition.clone().setProperty(aName).setTransitions(this)
        }
        return d[name]
    }

    propertiesAsList() {
        return Object.values(this.properties())
    }

    asString() {
        return this.propertiesAsList().map(t => t.asString()).join(", ")
    }

    syncToDomView() {
        console.log(this.typeId() + ".setTransition('" + this.asString() + "')")
        this.domView().setTransition(this.asString())
        return this
    }

    syncFromDomView() {
        this.setProperties({})

        const s = this.domView().transition()

        if (s !== "") {
            const transitionStrings = s.split(",")

            transitionStrings.forEach((tString) => {
                const t = DomTransition.clone().setFromString(tString)
                this.properties()[t.property()] = t
            })
        }

        return this
    }
}

DomTransitions.registerThisClass()

