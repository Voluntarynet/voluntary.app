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

    // editing control

    setIsEditable: function(aBool) {
        if (this._isEditable !== aBool) {
            this._isEditable = aBool
            this.syncEditingControl()
        }
        return this
    },

    isEditable: function() {
        return this._isEditable
    },

    setUsesDoubleTapToEdit: function(aBool) {
        if (this._usesDoubleTapToEdit !== aBool) {
            this._usesDoubleTapToEdit = aBool
            this.syncEditingControl()
        }
        return this
    },

    // double tap gesture

    newDoubleTapGestureRecognizer: function() { // private
        const tg = TapGestureRecognizer.clone()
        tg.setNumberOfTapsRequired(2)
        tg.setNumberOfFingersRequired(1)
        tg.setCompleteMessage("onDoubleTapComplete")
        //tg.setIsDebugging(true)
        return tg
    },

    doubleTapGestureRecognizer: function() {
        if (!this._doubleTapGestureRecognizer) {
            this._doubleTapGestureRecognizer = this.newDoubleTapGestureRecognizer()
        }
        return this._doubleTapGestureRecognizer
    },

    syncEditingControl: function() {
        if (this.isEditable()) {
            if (this.usesDoubleTapToEdit()) {
                //this.doubleTapGestureRecognizer().start()
                this.addGestureRecognizerIfAbsent(this.doubleTapGestureRecognizer())
                this.setContentEditable(false)
            } else {
                this.setContentEditable(true)
            }
        } else {
            if (this.usesDoubleTapToEdit()) {
                //this.doubleTapGestureRecognizer().stop()
                this.removeGestureRecognizer(this.doubleTapGestureRecognizer())
                this.setDoubleTapGestureRecognizer(null)
            }
            this.setContentEditable(false)
        }
        return this
    },

    onDoubleTapComplete: function(aGesture) {
        // make content editable and select text
        //console.log(this.typeId() + ".onDoubleTapComplete()")
        this.setContentEditable(true)
        this.focus()
        this.selectAll()
        this.focus()
    },

    onBlur: function() {
        DomStyledView.onBlur.apply(this)
        //console.log(this.typeId() + ".onBlur()")
        if (this.usesDoubleTapToEdit()) {
            this.setContentEditable(false)
        }
    },

    setFontSize: function(aNumber) {
        DomStyledView.setFontSize.apply(this, [aNumber])
        this.setMinAndMaxHeight(aNumber) // make sure TextfField can fit font size
        return this
    },

    setContentEditable: function(aBool) {
        DomStyledView.setContentEditable.apply(this, [aBool])
        //console.log(this.typeId() + ".setContentEditable(" + aBool + ") = ", this.contentEditable())
        //this.setIsRegisteredForClicks(this.contentEditable())  // is this needed after move to tap?
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

        // adjust font size (testing this out)
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
