"use strict"

window.BMNodeStyle = ideal.Proto.extend().newSlots({
    type: "BMNodeStyle",
    name: "",

	// use same names as css style, nulls aren't applied
	
    color: null,
    backgroundColor: null,
	opacity: null,
	// margin, padding, border,...
	// fontSize, fontFamily, fontStyle
	
	styleNames: ["color", "backgroundColor", "opacity"]
}).setSlots({
    init: function () {
        return this
    },

	applyToView: function(aView) {
		
		/*
		var e = aView.element()

		this.styleNames().forEach( (name) => { 
			var v = this[name].apply(this)
			if (v != null) {
				e.style[name] = this[name].apply(this)
			}
		})
		*/
		
        if (this.color() != null) {
            this.setColor(this.color()) 
        }
        
        if (this.backgroundColor() != null) {
            this.setBackgroundColor(this.backgroundColor()) 
        }

        if (this.opacity() != null) {
            this.setOpacity(this.opacity()) 
        }


		return this
	},
    

})
