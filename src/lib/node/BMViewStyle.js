"use strict"

window.BMViewStyle = ideal.Proto.extend().newSlots({
    type: "BMViewStyle",
    name: "",

    // use same names as css style, nulls aren't applied
	
    color: null,
    backgroundColor: null,
    opacity: null,
    borderLeft: null,
    borderRight: null,
	
    // margin, padding, border,...
    // fontSize, fontFamily, fontStyle
	
    styleNames: ["color", "backgroundColor", "opacity", "borderLeft", "borderRight"]
}).setSlots({
    init: function () {
        return this
    },

    description: function() {
        var parts = []
		
        this.styleNames().forEach( (name) => { 
            var v = this[name].apply(this)
            if (v != null) {
                parts.push(name + ":" + v)
            }
        })	
		
        return "{" + parts.join(", ") + "}"	
    },
	
    /*
	setBackgroundColor: function(c) {
		this._backgroundColor = c
		console.warn(this.typeId() + ".setBackgroundColor(" + c + ")")
		return this
	},
	*/
	
    copyFrom: function(aViewStyle) {
        aViewStyle.applyToView(this) // since it uses the same methods
        return this
    },
	
    applyToView: function(aView) {		
        this.styleNames().forEach( (name) => { 
            var v = this[name].apply(this)
            if (v != null) {
                aView[aView.setterNameForSlot(name)].apply(aView, [v])
            }
        })
		
        return this
    },
	
    /*
	applyToView: function(aView) {

        if (this.color() != null) {
            aView.setColor(this.color()) 
        }
        
        if (this.backgroundColor() != null) {
            aView.setBackgroundColor(this.backgroundColor()) 
        }

        if (this.opacity() != null) {
            aView.setOpacity(this.opacity()) 
        }

		return this
	},
	*/
    

})
