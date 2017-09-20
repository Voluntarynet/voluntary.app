
// this.titleView().setBorderRadius("8px 8px 0px 8px") // top-left, top-right,  bottom-right, bottom-left
// TODO: em vs px support?

"use strict"

window.DivBorderRadius = ideal.Proto.extend().newSlots({
    type: "DivBorderRadius",
    divView: null,

    topLeft: 0,
    topRight: 0,
    bottomRight: 0,
    bottomLeft: 0,
    partNames: ["topLeft", "topRight", "bottomRight", "bottomLeft"],
}).setSlots({
    init: function () {
        return this
    },
    
    clear: function() {
        this.setAll(0)
        return this
    },

    setAll: function(v) {
        if (!v) {
            v = 0
        }
        
        this.partSetters().forEach((setter) => {
            this[setter].apply(this, [v])
        })
        return this
    },

    partSetters: function() {
        return this.partNames().map((k) => { return k.asSetter() })
    },
    
    partValues: function() {
        return this.partNames().map((k) => { return this[k].apply(this) })
    },

	asString: function(aString) {
		return this.partValues().map((v) => { return v + "px" }).join(" ")		
	},
	
	setFromString: function(aString) {
		var parts = aString.split(" ").select((part) => { return part != "" })
		
		this.clear()
		
		if (parts.length == 1) {
		    this.setAll(Number(parts[0]))
		}

		var v;
		
	    v = parts.removeFirst()
		if (typeof(v) == "string") {
		    this.setTopLeft(Number(v))
		}
		
	    v = parts.removeFirst()
		if (typeof(v) == "string") {
		    this.setTopRight(Number(v))
		}	
		
	    v = parts.removeFirst()
		if (typeof(v) == "string") {
		    this.setBottomRight(Number(v))
		}	
		
	    v = parts.removeFirst()
		if (typeof(v) == "string") {
		    this.setBottomLeft(Number(v))
		}	

		return this
	},
	
	syncToDiv: function() {
		this.divView().setBorderRadius(this.asString())
		return this
	},
	
	syncFromDiv: function() {
		var s = this.divView().borderRadius()
		
		if (s) {
		    this.setFromString(s)
		} else {
		    this.clear()
		}
		
		return this
	},
})
