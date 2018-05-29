"use strict"

/*
    A view for a single line of text. 
    For multi-line text, use TextArea.
    
    Behavior:
    On Return/Enter key, it passes focus to the nextResponder/parent.
*/

window.TextField = DivStyledView.extend().newSlots({
    type: "TextField",
    isSelected: false,
    selectedColor: null,
    unselectedColor: null,
    doesClearOnReturn: false,
    doesHoldFocusOnReturn: false,
    doesTrim: true,
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
        this.formatValue()
        return this
    },
	
    returnStrings: function() {
        return ["<div><br></div>", "<br><br>"]
    },
	
    containsReturns: function() {
        returnStrings.forEach((returnString) => {
            if (s.contains(returnString)) {
                return true
            }
        })		
        return false
    },
	
    // ------------------

    setValue: function(newValue) {
        //var newValue = this.visibleValue()
	    this.setInnerHTML(newValue)
        return this
    },	
			
    value: function() {
	    /*
	    return this.element().text
        */
	    return this.innerHTML()
    },
	
    // ------------------
    
    onEnterKeyUp: function(event) {
	    //console.log(this.typeId() + ".onEnterKeyUp()")
	    //this.didEdit()
	    
	    this.formatValue()

        this.tellParentViews("didInput", this) 
            
        if (!this.doesHoldFocusOnReturn()) {
            //console.log(this.typeId() + " calling releaseFirstResponder")
            this.releaseFirstResponder()
        }
        
        if (this.doesClearOnReturn()) {
            this.setInnerHTML("")
            //this.focusAfterDelay(.125) // hack to get focus back after chat view scrolling - todo: fix this
        }
        
        return false
    },
	
    formatValue: function() {
	    var oldValue = this.innerHTML()
	    var newValue = this.innerText() // removes returns
        
        if (this.doesTrim()) {
            newValue = newValue.trim()
        }

        this.setInnerHTML(newValue)
        
	    //console.trace(this.type() + " formatValue '" + oldValue + "' -> '" + this.innerHTML() + "'")
        //console.log(this.type() + " after formatValue: '" + this.innerHTML() + "'")
        return this
    },
    
    /*
    setInput: function(s) {
        var n = this.node()
        if (n) {
            var m = n.nodeInputFieldMethod()
            if (m) {
                n[m].apply(n, [s])
            }
        }
        return this
    },
    
    */

    activate: function() {
        this.focus()
        return this
    },
})
