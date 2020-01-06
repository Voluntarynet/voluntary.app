"use strict"

/*

    BMViewStyle

    Representation of a single style state (a example of a state is "selected").

    See BMViewStyles for docs.
 
*/

window.BMViewStyle = class BMViewStyle extends ProtoClass {
    
    initPrototype () {
        this.newSlot("name", "")

        // use same names as css style, nulls aren't applied

        this.newSlot("color", null)
        this.newSlot("backgroundColor", null)
        this.newSlot("opacity", null)
        this.newSlot("borderLeft", null)
        this.newSlot("borderRight", null)
        this.newSlot("borderTop", null)
        this.newSlot("borderBottom", null)
        this.newSlot("borderWidth", null)
        this.newSlot("borderColor", null)
        this.newSlot("borderRadius", null)

        this.newSlot("styleNames", [
            "color", 
            "backgroundColor", 
            "opacity", 
            "borderLeft", "borderRight", "borderTop", "borderBottom",
            //"borderWidth"
            //"borderRadius"
        ])

    }

    init () {
        super.init()
        return this
    }

    isEmpty () {
        return this.styleNames().detect(s => s != null) === null
    }

    description () {
        const parts = []
		
        this.styleNames().forEach( (name) => { 
            const v = this[name].apply(this)
            if (!Type.isNull(v)) {
                parts.push(name + ":" + v)
            }
        })	
		
        return "{" + parts.join(", ") + "}"	
    }
	
    copyFrom (aViewStyle, copyDict) {
        aViewStyle.applyToView(this) // we're not a view but this works since we use the same methods/protocol
        return this
    }
	
    applyToView (aView) {		
        this.styleNames().forEach( (name) => { 
            const getterMethod = this[name]
            if (!getterMethod) {
                const errorMsg = "missing getter method: " + this.type() + "." + name + "()"
                console.warn(errorMsg)
                throw new Error(errorMsg)
            }
            const v = getterMethod.apply(this)
            if (v != null) {
                aView[aView.setterNameForSlot(name)].apply(aView, [v])
            }
        })
		
        return this
    }
    
}.initThisClass()
