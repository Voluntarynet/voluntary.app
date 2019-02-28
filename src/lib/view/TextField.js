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
    didTextInputNote: null,
    didTextEditNote: null,
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

        //this.setDidTextInputNote(NotificationCenter.shared().newNote().setSender(this).setName("didTextInput"))
        //this.setDidTextEditNote(NotificationCenter.shared().newNote().setSender(this).setName("didTextEdit"))
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
        //let newValue = this.visibleValue()
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

        if (this.didTextInputNote()) {
            this.didTextInputNote().post()
        }
        
        return false
    },
	
    formatValue: function() {
	    let oldValue = this.innerHTML()
	    let newValue = this.innerText() // removes returns
        
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
        let n = this.node()
        if (n) {
            let m = n.nodeInputFieldMethod()
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

    /*
    setSelectAllOnDoubleClick: function(aBool) {
        this.setIsRegisteredForClicks(aBool)
        return this
    },

    onDoubleClick: function (event) {
        console.log(this.type() + ".onDoubleClick()")
        //this.focus()
        this.selectAll() // looses focus!
        this.element().focus()
        //this.focusAfterDelay(.125) 
        return true
    },
    */
})
