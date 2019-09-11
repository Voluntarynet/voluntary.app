"use strict"

/*

    BooleanView


*/

DomStyledView.newSubclassNamed("BooleanView").newSlots({
    isSelected: false,
    selectedColor: null,
    unselectedColor: null,
    doesClearOnReturn: false,
    doesHoldFocusOnReturn: false,
    value: false,
    isEditable: false,
    checkedIcon: null, 
    uncheckedIcon: null,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        //this.setDisplay("inline-block")
        this.turnOffUserSelect()
        this.setWhiteSpace("nowrap")
        this.setOverflow("hidden")
        this.setTextOverflow("ellipsis")
        this.setSpellCheck(false)
        this.setContentEditable(false)
		
        //this.setUnfocusOnEnterKey(true)
        //this.setIsRegisteredForKeyboard(true) // gets set by setContentEditable()

        this.setupForRoundCheckbox()
        //this.setupForSquareCheckbox()
        //this.setupForToggleSwitch()
        return this
    },
    
    setupForRoundCheckbox: function() {
        this.setCheckedIcon("checkbox-circle-checked")
        this.setUncheckedIcon("checkbox-circle-unchecked")
        return this
    },

    setupForSquareCheckbox: function() {
        this.setCheckedIcon("checkbox-square-checked")
        this.setUncheckedIcon("checkbox-square-unchecked")
        return this
    },

    setupForToggleSwitch: function() {
        this.setCheckedIcon("toggle-on")
        this.setUncheckedIcon("toggle-off")
        return this
    },

    // editable
    
    setIsEditable: function(aBool) {        
        this._isEditable = aBool
        
        if (this._isEditable) {
            this.setIsRegisteredForClicks(true)
        } else {
            this.setIsRegisteredForClicks(false)
        }
        
        this.updateIcon()
        
        return this
    },
    
    // clicks
    
    onClick: function(event) {
        DomStyledView.onClick.apply(this, [event])
        this.toggle()
        return this
    },
    
    toggle: function() {
        this.setValue(!this.value())
        //this.scheduleSyncToNode()
        this.didEdit()
        return this
    },
    
    activate: function() {
        this.toggle()
        return this
    },
    
    // ------------------
    
    setValue: function(v) {
        if (v === null) {
            v = false;
        }
        
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
	
    /*
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
		this.setInnerHTML(this.currentUnicode())
		return this
	},
    */
    
    setBackgroundColor: function(s) {

        return this
    },
	
    // svg icon
	
    currentIcon: function() {
	    return this.isChecked() ? this.checkedIcon() : this.uncheckedIcon();
    },
	
    updateIcon: function () {
        this.setMinAndMaxWidth(16).setMinAndMaxHeight(16)
        this.setBackgroundImageUrlPath(this.pathForIconName(this.currentIcon()))
        this.setBackgroundSizeWH(16, 16) // use "contain" instead?
        this.setBackgroundPosition("center")
        this.setOpacity(this.isEditable() ? 1 : 0.5)
        return this
    },
})
