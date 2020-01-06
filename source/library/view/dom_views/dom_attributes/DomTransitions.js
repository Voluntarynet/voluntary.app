"use strict"

/*

    DomTransition
         
    Example use in a DomView:

            aDomView.transitions().at("opacity").updateDuration("0.3s")

        updates the opacity time without changing other transition settings
        

    NOTES:

        CSS transition value example:
        
            transition: width 2s linear 1s, height 2s ease 1s; 
        
        1st time value is the duration, 
        2nd time value is the delay


*/


window.DomTransitions = class DomTransitions extends ProtoClass {
    initPrototype () {
        this.newSlot("properties", null)
        this.newSlot("domView", null)
    }

    init() {
        super.init()
        this.setProperties({})
    }

    at(aName) {
        const d = this.properties()
        if (!d.hasOwnProperty(name)) {
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
        //this.debugLog(".setTransition('" + this.asString() + "')")
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
}.initThisClass()


