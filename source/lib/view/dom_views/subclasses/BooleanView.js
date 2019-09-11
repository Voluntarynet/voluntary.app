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
    checkView: null,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        //this.setDisplay("inline-block")
        this.turnOffUserSelect()
        this.setWhiteSpace("nowrap")
        this.setOverflow("hidden")
        //this.setTextOverflow("ellipsis")
        this.setSpellCheck(false)
        this.setContentEditable(false)
        this.setBorder("1px solid")
        this.setBorderColor(this.trueCheckColor())
        this.setBorderRadius(3)

        const size = 15
        const padSize = 2
        const innerSize = size - padSize * 2 - 2;

        this.setMinAndMaxWidth(size)
        this.setMinAndMaxHeight(size)
        this.setPadding(padSize)

        this.setOverflow("hidden")

        const cv = DomView.clone().setDivClassName("InnerCheckbox")
        cv.setBackgroundColor(this.falseCheckColor())
        cv.setBorderRadius(2)

        cv.setMargin(0)
        cv.setPadding(0)
        
        cv.setMinAndMaxWidth(innerSize)
        cv.setMinAndMaxHeight(innerSize)

        cv.setTransition("background-color 0.1s")
        this.setCheckView(cv)
        this.addSubview(cv)
		
        //this.setUnfocusOnEnterKey(true)
        //this.setIsRegisteredForKeyboard(true) // gets set by setContentEditable()

        //this.setupForRoundCheckbox()
        //this.setupForSquareCheckbox()
        //this.setupForToggleSwitch()
        return this
    },
    
    /*
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
    */

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
    
    trueCheckColor: function() {
        //return this.color()
        return "#aaa"
    },

    falseCheckColor: function() {
        return "transparent"
    },
    
    currentCheckColor: function() {
        return this.value() ? this.trueCheckColor() : this.falseCheckColor()
    },

    updateIcon: function () {

        this.checkView().setBackgroundColor(this.currentCheckColor())

        /*
        this.setBackgroundImageUrlPath(this.pathForIconName(this.currentIcon()))
        this.setBackgroundSizeWH(16, 16) // use "contain" instead?
        this.setBackgroundPosition("center")
        this.setOpacity(this.isEditable() ? 1 : 0.5)
        */
        return this
    },
})
