"use strict"

/*

    TextField
    
    A view for a single line of text. 
    For multi-line text, use TextArea.
    
    Behavior:
    On Return/Enter key, it passes focus to the nextResponder/parent.

*/

DomStyledView.newSubclassNamed("TextField").newSlots({
    isSelected: false,
    selectedColor: null,
    unselectedColor: null,
    doesClearOnReturn: false,
    doesHoldFocusOnReturn: false,
    doesTrim: true,
    didTextInputNote: null,
    didTextEditNote: null,
    usesDoubleTapToEdit: false, // has to start false for proper state setup
    doubleTapGestureRecognizer: null,
    isEditable: false, // need to separate from contentEditable since we want to override when usesDoubleTapToEdit is true.
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        //this.setDisplay("inline-block") // if we do it here, we can override it with css classes. Should we eliminate CSS?
        this.turnOffUserSelect()
        this.setWhiteSpace("nowrap")
        this.setOverflow("hidden")
        this.setTextOverflow("clip")
        this.setSpellCheck(false)
        this.setMinWidth(10)
		
        //this.setUnfocusOnEnterKey(true)
        //this.setIsRegisteredForKeyboard(true) // gets set by setContentEditable()
        this.formatValue()

        //this.setDidTextInputNote(NotificationCenter.shared().newNote().setSender(this).setName("didTextInput"))
        //this.setDidTextEditNote(NotificationCenter.shared().newNote().setSender(this).setName("didTextEdit"))

        return this
    },

    setIsEditable: function(aBool) {
        this._isEditable = aBool
        if (!this._doubleTapGestureRecognizer) {
            this.setContentEditable(aBool)
        }
        return this
    },

    isEditable: function() {
        return this._isEditable
    },

    doubleTapGestureRecognizer: function() {
        if (!this._doubleTapGestureRecognizer) {
            const tg = TapGestureRecognizer.clone()
            tg.setNumberOfTapsRequired(2)
            tg.setNumberOfFingersRequired(1)
            tg.setCompleteMessage("onDoubleTapComplete")
            //tg.setIsDebugging(true)
            this._doubleTapGestureRecognizer = tg
        }
        return this._doubleTapGestureRecognizer
    },

    setUsesDoubleTapToEdit: function(aBool) {
        if (this._usesDoubleTapToEdit !== aBool) {
            this._usesDoubleTapToEdit = aBool

            if (this._usesDoubleTapToEdit) {
                this.addGestureRecognizer(this.doubleTapGestureRecognizer())
                this.setContentEditable(false)
            } else {
                this.removeGestureRecognizer(this.doubleTapGestureRecognizer())
                this.setDoubleTapGestureRecognizer(null)
                if (this.isEditable()) {
                    this.setContentEditable(true)
                }
            }
        }
        return this
    },

    onBlur: function() {
        DomStyledView.onBlur.apply(this)
        console.log(this.typeId() + ".onBlur()")
        if (this.usesDoubleTapToEdit()) {
            this.setContentEditable(false)
        }
    },

    onTapBegin: function(aGesture) {
        console.log(this.typeId() + ".onTapBegin()")
        return true
    },

    onTapCancelled: function(aGesture) {
        console.log(this.typeId() + ".onTapCancelled()")
    },

    onDoubleTapComplete: function(aGesture) {
        console.log(this.typeId() + ".onDoubleTapComplete()")
        this.setContentEditable(true)
        this.focus()
    },

    setFontSize: function(aNumber) {
        DomStyledView.setFontSize.apply(this, [aNumber])
        this.setMinAndMaxHeight(aNumber) // make sure TextfField can fit font size
        return this
    },

    setContentEditable: function(aBool) {
        DomStyledView.setContentEditable.apply(this, [aBool])
        //console.log(this.typeId() + ".setContentEditable(" + aBool + ") = ", this.contentEditable())
        this.setIsRegisteredForClicks(this.contentEditable()) 
        return this
    },
	
    returnStrings: function() {
        return ["<div><br></div>", "<br><br>"]
    },
	
    containsReturns: function() {
        const value = this.value() // correct?
        return returnStrings.detect(returnString => value.contains(returnString))		
    },
	
    // ------------------

    setValue: function(newValue) {
        return this.setString(newValue)
    },

    value: function() {
        // this.element().text ?
        return this.string()
    },

    setString: function(newValue) {
        //let newValue = this.visibleValue()
        DomStyledView.setString.apply(this, [newValue])
        //console.log("textfield '" + newValue + "' usesDoubleTapToEdit:", this.usesDoubleTapToEdit())
        return this
    },
	
    // ------------------
    
    onKeyDown: function(event) {
        const controlDown   = Keyboard.shared().controlKey().isDown()
        const equalSignDown = Keyboard.shared().equalsSignKey().isDown()
        const minusDown     = Keyboard.shared().minusKey().isDown()


        if (controlDown) {
            const fontSize = this.computedFontSize()

            if (equalSignDown) {
                this.setFontSize(fontSize + 1)
            } else if (minusDown) {
                if (fontSize > 1) { 
                    this.setFontSize(fontSize - 1)
                }
            }
        }

        return DomStyledView.onKeyDown.apply(this, [event])
    },

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
            //this.focusAfterDelay(.125) // hack to get focus back after chat view scrolling - TODO: fix this
        }

        if (this.didTextInputNote()) {
            this.didTextInputNote().post()
        }
        
        return false
    },
	
    formatValue: function() {
	    const oldValue = this.innerHTML()
	    let newValue = this.innerText() // removes returns
        
        if (this.doesTrim()) {
            newValue = newValue.trim()
        }

        this.setInnerHTML(newValue)
        
	    //console.trace(this.type() + " formatValue '" + oldValue + "' -> '" + this.innerHTML() + "'")
        //console.log(this.typeId() + " after formatValue: '" + this.innerHTML() + "'")
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
        console.log(this.typeId() + ".onDoubleClick()")
        //this.focus()
        this.selectAll() // looses focus!
        this.element().focus()
        //this.focusAfterDelay(.125) 
        return true
    },
    */

    
    onClick: function(event) {
        // to prevent click-to-edit event from selecting the background row
        //console.log(this.typeId() + ".onClick()")

        if (this.contentEditable()) {
            this.sendActionToTarget()
            event.stopPropagation()
            return false
        }

        return DomStyledView.onClick.apply(this, [event])
    },

})
