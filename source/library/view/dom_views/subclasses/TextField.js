"use strict"

/*

    TextField
    
    A view for a single line of text. 
    For multi-line text, use TextArea.
    
    Behavior:
    On Return/Enter key, it passes focus to the nextResponder/parent.

*/

window.TextField = class TextField extends DomStyledView {
    
    initPrototype () {
        this.newSlot("selectedColor", null)
        this.newSlot("unselectedColor", null)
        this.newSlot("doesClearOnReturn", false)
        this.newSlot("doesHoldFocusOnReturn", false)
        this.newSlot("doesTrim", false)
        this.newSlot("didTextInputNote", null)
        this.newSlot("didTextEditNote", null)

        // has to start false for proper state setup
        this.newSlot("usesDoubleTapToEdit", false) 

        this.newSlot("doubleTapGestureRecognizer", null)

        // need to separate from contentEditable since we want to override when usesDoubleTapToEdit is true.
        this.newSlot("isEditable", false)
    }

    init () {
        super.init()
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
    }

    // editing control

    setIsEditable (aBool) {
        if (this._isEditable !== aBool) {
            this._isEditable = aBool
            this.syncEditingControl()
        }
        return this
    }

    
    isEditable () {
        return this._isEditable
    }
    

    setUsesDoubleTapToEdit (aBool) {
        if (this._usesDoubleTapToEdit !== aBool) {
            this._usesDoubleTapToEdit = aBool
            this.syncEditingControl()
        }
        return this
    }

    // double tap gesture

    newDoubleTapGestureRecognizer () { // private
        const tg = TapGestureRecognizer.clone()
        tg.setNumberOfTapsRequired(2)
        tg.setNumberOfFingersRequired(1)
        tg.setCompleteMessage("onDoubleTapComplete")
        //tg.setIsDebugging(true)
        return tg
    }

    doubleTapGestureRecognizer () {
        if (!this._doubleTapGestureRecognizer) {
            this._doubleTapGestureRecognizer = this.newDoubleTapGestureRecognizer()
        }
        return this._doubleTapGestureRecognizer
    }

    syncEditingControl () {
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
    }

    onDoubleTapComplete (aGesture) {
        // make content editable and select text
        //this.debugLog(".onDoubleTapComplete()")
        if (this.contentEditable()) {
            //this.setBorder("1px dashed red")
            return this
        }
        this.setContentEditable(true)
        this.focus()
        this.selectAll()
        //this.focus()
        //this.setBorder("1px dashed white")
        return this
    }

    onBlur () {
        super.onBlur()
        //this.debugLog(".onBlur()")
        if (this.usesDoubleTapToEdit()) {
            this.setContentEditable(false)
            this.setBorder("none")
            this.turnOffUserSelect()
        }
    }

    setFontSize (aNumber) {
        super.setFontSize(aNumber)
        this.setMinAndMaxHeight(aNumber + 2) // make sure TextfField can fit font size
        this.didEdit()
        return this
    }

    setContentEditable (aBool) {
        super.setContentEditable(aBool)
        //this.debugLog(".setContentEditable(" + aBool + ") = ", this.contentEditable())
        //this.setIsRegisteredForClicks(this.contentEditable())  // is this needed after move to tap?
        return this
    }
	
    returnStrings () {
        return ["<div><br></div>", "<br><br>"]
    }
	
    containsReturns () {
        const value = this.value() // correct?
        return returnStrings.detect(returnString => value.contains(returnString))		
    }
	
    // ------------------

    setValue (newValue) {
        return this.setString(newValue)
    }

    value () {
        // this.element().text ?
        return this.string()
    }

    
    setString (newValue) {
        if (newValue === null) {
            newValue = ""
        }

        const oldValue = this.string()
        //let newValue = this.visibleValue()
        if (oldValue !== newValue) {
            super.setString(newValue)
            /*
            this.debugLog(" setString(")
            console.log("    old: '" + oldValue + "'")
            console.log("    new: '" + newValue + "'")
            console.log("---")
            */
            //console.log("textfield '" + newValue + "' usesDoubleTapToEdit:", this.usesDoubleTapToEdit())
        }
        return this
    }
    
	
    // ------------------

    adjustFontSizeWithKeyboard () {
        const kb = Keyboard.shared()
        const controlDown   = kb.controlKey().isDown()
        const equalSignDown = kb.equalsSignKey().isDown()
        const minusDown     = kb.minusKey().isDown()

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
        return this
    }
    
    onKeyUp (event) {
        //this.debugLog(" onKeyUp ", event)
        this.adjustFontSizeWithKeyboard()
        super.onKeyUp(event)
        //this.debugLog(" onKeyUp value: [" + this.value() + "]")
        this.didEdit()
        return false
    }

    onEnterKeyUp (event) {
	    //this.debugLog(".onEnterKeyUp()")
	    //this.didEdit()

        this.formatValue()

        
        this.tellParentViews("didInput", this) 
            
        if (!this.doesHoldFocusOnReturn()) {
            //this.debugLog(" calling releaseFirstResponder")
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
    }
	
    formatValue () {
	    const oldValue = this.innerHTML()
	    let newValue = this.innerText() // removes returns
        
        if (this.doesTrim()) {
            newValue = newValue.trim()
        } 

        if (true) {
            //newValue.replaceAll("\n", "<br>")
        }
        
        
        if (newValue !== oldValue) {
            this.debugLog("formatValue newValue !== oldValue")
            this.debugLog(" newValue: [" + newValue + "]")
            this.setInnerHTML(newValue)
            this.didEdit()
        }
	    //console.trace(this.type() + " formatValue '" + oldValue + "' -> '" + this.innerHTML() + "'")
        //this.debugLog(" after formatValue: '" + this.innerHTML() + "'")
        return this
    }
    
    /*
    setInput (s) {
        const n = this.node()
        if (n) {
            const m = n.nodeInputFieldMethod()
            if (m) {
                n[m].apply(n, [s])
            }
        }
        return this
    }
    
    */

    activate () {
        this.focus()
        return this
    }

    /*
    setSelectAllOnDoubleClick (aBool) {
        this.setIsRegisteredForClicks(aBool)
        return this
    }

    onDoubleClick (event) {
        this.debugLog(".onDoubleClick()")
        //this.focus()
        this.selectAll() // looses focus!
        this.element().focus()
        //this.focusAfterDelay(.125) 
        return true
    }
    */

    
    onClick (event) {
        // to prevent click-to-edit event from selecting the background row
        //this.debugLog(".onClick()")

        if (this.contentEditable()) {
            this.sendActionToTarget()
            event.stopPropagation()
            return false
        }

        return super.onClick(event)
    }

    didEdit () {
        super.didEdit()
        return this
    }


}.initThisClass()
