"use strict"

/*
    DivStyledView

    A base view to handle styles in a uniform way. 
    Holds an instance of BMViewStyles which holds a set of BMViewStyle instances, one for each style.

    Overview:

        DivStyledView
          styles -> BMViewStyles
                        selected -> BMViewStyle
                        unselected -> BMViewStyle
                                        color
                                        backgroundColor
                                        opacity
                                        borderLeft
                                        borderRight

                       
    

    Supported styles:

    - unselected
    - selected

*/

window.DivStyledView = DivView.extend().newSlots({
    type: "DivStyledView",
    styles: null,
    isSelected: false,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        return this
    },

    // styles
	
    styles: function() { 
        // since not all views use them, do lazy style setup 
        if (!this._styles) {
            this.setStyles(BMViewStyles.clone()) 
        }
        return this._styles
    },
	
    applyStyles: function() {
        let style = null
        if (this.isSelected()) {
            style = this.styles().selected()
            //console.log(this.typeId() + ".applyStyles() selected ", style.description())
        } else {
            style = this.styles().unselected()
            //console.log(this.typeId() + ".applyStyles() unselected ", style.description())
        }
		
        style.applyToView(this)
        //setTimeout(() => { style.applyToView(this) }, 0)
		
        return this
    },
	
    // TODO: add hover style support on mouse over event?
    // or apply to this element's hover CSS settings?
	
    setSelectedColor: function(c) {
        this.styles().selected().setColor(c)
        return this
    },
	
    /*
	setSelectedBackgroundColor: function(c) {
		this.styles().selected().setBackgroundColor(c)
		return this
	},
	*/

    // select
	
    setIsSelected: function(aBool) {
        if (aBool != this._isSelected) {
	    	this._isSelected = aBool
	    	this.didChangeIsSelected()
        }
	    return this
    },

    didChangeIsSelected: function() {
        this.applyStyles()
        return this
    },

	
    select: function() {
        this.setIsSelected(true)		
        return this
    },

    unselect: function() {
        this.setIsSelected(false)
        return this
    },
	
})
