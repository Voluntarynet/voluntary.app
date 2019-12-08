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


window.DomStyledView = class DomStyledView extends DomView {
    
    initPrototype () {
        this.newSlot("styles", null)
        this.newSlot("isSelected", false).setOwnsSetter(true).setDoesHookSetter(true)
    }

    init () {
        super.init()
        return this
    }

    // styles

    lookedUpStyles () {
        return null
    }
	
    styles () { 
        // since not all views use them, do lazy style setup 
        if (!this._styles) {
            this.setStyles(BMViewStyles.clone()) 
        }
        return this._styles
    }

    currentColor () {
        return this.currentStyle().color()
    }

    currentBgColor () {
        return this.currentStyle().backgroundColor()
    }

    currentStyle () {
        let style = null
        if (this.isSelected()) {
            style = this.styles().selected()
            //this.debugLog(".applyStyles() selected ", style.description())
        } else {
            style = this.styles().unselected()
            //this.debugLog(".applyStyles() unselected ", style.description())
        }
        return style
    }
	
    applyStyles () {
        const style = this.currentStyle()
        style.applyToView(this)		
        return this
    }

    // select
	
    setIsSelected (aBool) {
        if (aBool !== this._isSelected) {
	    	this._isSelected = aBool
	    	this.didChangeIsSelected()
        }
        console.log(this.typeId() + " setIsSelected(" + aBool + ")")
	    return this
    }

    didUpdateSlotIsSelected (oldValue, newValue) {
        // sent by hooked setter
        this.didChangeIsSelected()
        return this
    }

    didChangeIsSelected () {
        this.applyStyles()
        return this
    }

	
    select () {
        this.setIsSelected(true)		
        return this
    }

    unselect () {
        this.setIsSelected(false)
        return this
    }
	
}.initThisClass()
