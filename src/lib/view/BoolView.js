"use strict"

window.BoolView = DivStyledView.extend().newSlots({
    type: "BoolView",
	isSelected: false,
	selectedColor: null,
	unselectedColor: null,
	doesClearOnReturn: false,
	doesHoldFocusOnReturn: false,
	value: false,
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
		
		//this.setUnfocusOnEnterKey(true)
		//this.setIsRegisteredForKeyboard(true) // gets set by setContentEditable()
		this.removeReturns()
        return this
    },
	
	// ------------------

	setValue: function(newValue) {
        //var newValue = this.visibleValue()
        if (this.innerHTML() != newValue) {
            if (this.isActiveElementAndEditable()) {
                this.blur()
			    this.setInnerHTML(newValue)
                this.focus()
			} else {
			    this.setInnerHTML(newValue)
			}
		}
		return this
	},	
	
	value: function() {
	    return this.isChecked() === true
	},
	
	isChecked: function() {
	    return this.innerHTML() == this.checkedUnicode()
	},
	
	checkedUnicode: function() {
	     return "&#10004;"
	},
	
	uncheckedUnicode: function() {
	     return "&#10007;"
	},
})
