"use strict"

window.BoolView = DivStyledView.extend().newSlots({
    type: "BoolView",
	isSelected: false,
	selectedColor: null,
	unselectedColor: null,
	doesClearOnReturn: false,
	doesHoldFocusOnReturn: false,
	value: false,
	isEditable: false,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
		this.setDisplay("inline-block")
        this.turnOffUserSelect()
		this.setWhiteSpace("nowrap")
		this.setOverflow("hidden")
		this.setDisplay("inline-block")
		this.setTextOverflow("ellipsis")
		this.setSpellCheck(false)
		this.setContentEditable(false)
		
		//this.setUnfocusOnEnterKey(true)
		//this.setIsRegisteredForKeyboard(true) // gets set by setContentEditable()
		//this.removeReturns()
        return this
    },
    
    // editable
    
    setIsEditable: function(aBool) {
        console.log(this.type() + ".setIsEditable(" + aBool + ")")
        
        this._isEditable = aBool
        
        if (this._isEditable) {
            this.setIsRegisteredForClicks(true)
        } else {
            this.setIsRegisteredForClicks(false)
        }

        return this
    },
    
    isEditable: function() {
        return this._isEditable
    },
    
    // clicks
    
    onClick: function(event) {
        console.log(this.type() + ".onClick()\n")
        DivStyledView.onClick.apply(this, [event])
        this.toggle()
        return this
    },
    
    toggle: function() {
        console.log(this.type() + ".toggle()")
        this.setValue(!this.value())
        //this.scheduleSyncToNode()
        this.didEdit()
        return this
    },
    
	// ------------------

	setValue: function(v) {
	    console.log(this.type() + ".setValue( " + typeof(v) + ":" + v + ")")
	    assert(typeof(v) == "boolean")
	    this._value = v

		//this.updateUnicode()
        this.updateIcon()
        
		return this
	},	
	
	value: function() {
	    return this._value
	},
	
	isChecked: function() {
	    return this.value()
	},
	
	// unicode
	
	checkedUnicode: function() {
	     return "&#10004;"
	},
	
	uncheckedUnicode: function() {
	     return "&#10007;"
	},
	
	currentUnicode: function() {
	    return this.isChecked() ? this.checkedUnicode() : this.uncheckedUnicode();
	},
	
	updateUnicode: function() {
		this.setSafeInnerHTML(this.currentUnicode())
		return this
	},
	
	// icon
	
	/*
	checkedIcon: function() {
	   return "checkbox-square-checked" 
	},
	
	uncheckedIcon: function() {
	   return "checkbox-square-unchecked" 
	},
	*/
	
	checkedIcon: function() {
	   return "checkbox-circle-checked" 
	},
	
	uncheckedIcon: function() {
	   return "checkbox-circle-unchecked" 
	},
	
	
	
	currentIcon: function() {
	    return this.isChecked() ? this.checkedIcon() : this.uncheckedIcon();
	},
	
    updateIcon: function () {
        this.setMinAndMaxWidth(16).setMinAndMaxHeight(16)
        console.log("this.currentIcon() = ", this.currentIcon())
        this.setBackgroundImageUrlPath(this.pathForIconName(this.currentIcon()))
		this.setBackgroundSizeWH(16, 16) // use "contain" instead?
		this.setBackgroundPosition("center")
		this.setOpacity(1)
        return this
    },
})
