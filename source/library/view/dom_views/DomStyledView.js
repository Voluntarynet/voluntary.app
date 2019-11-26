"use strict"

/*
    DomStyledView

    (one step towards eliminating the remaining css files)

    A base view to handle styles in a uniform way. 
    Holds an instance of BMViewStyles which holds a set of BMViewStyle instances, one for each style.

    Overview:

        DomStyledView
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

DomView.newSubclassNamed("DomStyledView").newSlots({
    styles: null,
    isSelected: false,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        return this
    },

    // styles

    lookedUpStyles: function() {
        return null
    },
	
    styles: function() { 
        // since not all views use them, do lazy style setup 
        if (!this._styles) {
            this.setStyles(BMViewStyles.clone()) 
        }
        return this._styles
    },

    currentColor: function() {
        return this.currentStyle().color()
    },

    currentBgColor: function() {
        return this.currentStyle().backgroundColor()
    },

    currentStyle: function() {
        let style = null
        if (this.isSelected()) {
            style = this.styles().selected()
            //this.debugLog(".applyStyles() selected ", style.description())
        } else {
            style = this.styles().unselected()
            //this.debugLog(".applyStyles() unselected ", style.description())
        }
        return style
    },
	
    applyStyles: function() {
        const style = this.currentStyle()
        style.applyToView(this)		
        return this
    },

    // select
	
    setIsSelected: function(aBool) {
        if (aBool !== this._isSelected) {
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
	
}).initThisProto()
