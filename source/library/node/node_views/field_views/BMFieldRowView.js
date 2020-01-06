"use strict"

/*

    BMFieldRowView

*/

window.BMFieldRowView = class BMFieldRowView extends BrowserFieldRow {
    
    initPrototype () {
        this.newSlot("keyView", null)
        this.newSlot("valueView", null)
        this.newSlot("errorView", null)
        this.newSlot("noteView", null)
        this.newSlot("editableColor", "#aaa")
        this.newSlot("uneditableColor", "#888")
        this.newSlot("errorColor", "red")
    }

    init () {
        super.init()
        
        this.setMaxHeight("none")
        this.setHeight("auto")

        this.setKeyView(TextField.clone().setDivClassName("BMFieldKeyView"))
        this.addContentSubview(this.keyView())     
   		this.keyView().turnOffUserSelect().setSpellCheck(false)   
        //this.keyView().setMarginLeft(18)

        //this.contentView().setPaddingLeft(20)
        this.setValueView(this.createValueView())
        this.addContentSubview(this.valueView())  
      
        this.valueView().setUserSelect("text")   // should the value view handle this?
        this.valueView().setSpellCheck(false)   // should the value view handle this?
        //this.valueView().setWidthPercentage(100) 

        this.setNoteView(DomView.clone().setDivClassName("BMFieldRowViewNoteView"))
        this.addContentSubview(this.noteView())
        this.noteView().setUserSelect("text")

        this.setErrorView(DomView.clone().setDivClassName("BMFieldRowViewErrorView"))
        this.addContentSubview(this.errorView())
        this.errorView().setUserSelect("text").setSpellCheck(false)
        //this.errorView().setInnerHTML("error")
        this.errorView().setColor("red")

        return this
    }

    createValueView () {
        const tf = TextField.clone().setDivClassName("BMFieldValueView")
        //tf.setSelectAllOnDoubleClick(true)
        return tf
    }

    // colors

    currentBackgroundCssColor () {
        const bg = this.columnGroup().computedBackgroundColor()
        return CSSColor.clone().setCssColorString(bg)
    }

    valueBackgroundCssColor () {
        return this.currentBackgroundCssColor().contrastComplement(0.2)
    }

    valueBackgroundColor () {
        return this.valueBackgroundCssColor().cssColorString()
    }

    editableColor () {
        return this.valueBackgroundCssColor().contrastComplement(0.2).cssColorString()
    }

    keyViewColor () {
        //console.log(this.node().title() + " " + this.typeId() + ".isSelected() = ", this.isSelected())
        return this.currentStyle().color()
        //return this.valueBackgroundCssColor().contrastComplement(0.2).cssColorString()
    }

	
    // visible key and value
    
    visibleValue () {
        return this.node().visibleValue()
    }
	
    visibleKey () {
        return this.node().key()
    }

    // sync 
    
    /*
    syncValueViewToNode () {
        //this.debugLog(".syncValueViewToNode " + this.node().type())
	    if (this.node().type() === "BMBooleanField" && this.valueView().type() !== "BooleanView") {
	        //console.log("syncValueViewToNode setup bool view")
	        const booleanView = BooleanView.clone()
            this.removeContentSubview(this.valueView())  
            this.setValueView(booleanView)
            this.addContentSubview(this.valueView())  
            //this.valueView().setUserSelect("text")   // should the value view handle this?
		    //this.valueView().setSpellCheck(false)   // should the value view handle this?	        
            //return TextField.clone().setDivClassName("BMFieldValueView")
        }
    }
    */
    
    didChangeIsSelected () {
        super.didChangeIsSelected()
        this.syncFromNode() // need this to update selection color on fields?
        return this
    }

    /*
    syncKeyFromNode () {

    }

    syncValueFromNode () {

    }
    */

    syncFromNode () {
        super.syncFromNode()
        //this.debugLog(" syncFromNode")
		
        this.node().prepareToSyncToView()
        //this.syncValueViewToNode() // (lazy) set up the value view to match the field's type

        const node = this.node()
        const keyView = this.keyView()
        const valueView = this.valueView()
        const noteView = this.noteView()
        const errorView = this.errorView()

        if (node.isVisible()) {
            this.setDisplay("block")
        } else {
            this.setDisplay("none")
        }

        keyView.setInnerHTML(this.visibleKey())

        let newValue = this.visibleValue()
		
        /*
        console.log("")
        console.log("FieldRow.syncFromNode:")
        console.log("  valueView.type() === ", valueView.type())
        console.log("  valueView.innerHTML() === '" + valueView.innerHTML() + "'")
        console.log("  valueView.value === ", valueView.value)
        console.log("  newValue =  '" + newValue + "'")
        */
        
        if (newValue === null) { 
            // commenting out - this causes a "false" to be displayed in new fields
            //newValue = false; // TODO: find better way to deal with adding/removing new field
        } 

        valueView.setValue(newValue)
        
        // visible
        keyView.setIsVisible(node.keyIsVisible())
        valueView.setIsVisible(node.valueIsVisible())
		
        // editable
        keyView.setIsEditable(node.keyIsEditable())
        valueView.setIsEditable(node.valueIsEditable())

        keyView.setColor(this.keyViewColor())

        if (!node.valueIsEditable()) {
            //console.log("fieldview key '", node.key(), "' node.valueIsEditable() = ", node.valueIsEditable(), " setColor ", this.uneditableColor())
            //valueView.setColor(this.uneditableColor())
            valueView.setColor(this.styles().disabled().color())
        } else {
            //valueView.setColor(this.editableColor())
            valueView.setColor(this.currentStyle().color())
        }
		
        // change color if value is invalid
		
        const color = valueView.color()
        
        if (node.valueError()) {
            //valueView.setColor(this.errorColor())
            //valueView.setToolTip(node.valueError())
            errorView.setColor(this.errorColor())
            errorView.setInnerHTML(node.valueError())
            errorView.fadeInHeightToDisplayBlock(15)

        } else {
            //valueView.setBackgroundColor("transparent")
            //valueView.setBorder("1px solid white")
            //valueView.setBorderRadius(5)
            //valueView.setBackgroundColor(this.valueBackgroundColor())
            valueView.setBackgroundColor("transparent")
            valueView.setColor(color)
            //valueView.setToolTip("")
            //errorView.setDisplay("none")
            //errorView.setInnerHTML("")
            errorView.fadeOutHeightToDisplayNone()
        }
				
        if (this.visibleNote()) {
            noteView.setDisplay("block")
            noteView.setInnerHTML(this.visibleNote())
        } else {
            noteView.setDisplay("none")
            noteView.setInnerHTML("")
        }

        return this
    }

    visibleNote () {
        return this.node().note()
    }
    
    syncToNode () {
        const node = this.node()

        if (node.keyIsEditable()) {
        	node.setKey(this.keyView().value())
        }
	
        if (node.valueIsEditable()) {
        	node.setValue(this.valueView().value())
        }
		
        super.syncToNode()
        return this
    }
    
    onDidEdit (changedView) {
        //this.syncToNode() 
        this.scheduleSyncToNode() 
        //this.log(this.type() + " onDidEdit")   
        //this.node().setKey(this.keyView().value())
        //this.node().setValue(this.valueView().value())
        //this.node().didUpdateView(this)
        //this.scheduleSyncFromNode() // needed for validation? // causes bug with TextEditing if a 2nd edit is ahead of node state
        return true
    }

    updateSubviews () {
        super.updateSubviews()
		
        const node = this.node()

        if (node && node.nodeMinRowHeight()) {
            if (node.nodeMinRowHeight() === -1) {
                this.setHeight("auto")
                this.setPaddingBottom("calc(100% - 20px)")

            } else {
                this.setHeight(this.pxNumberToString(node.nodeMinRowHeight()))
            }
        }
        
        return this
    }

    /*
    applyStyles () {
        super.applyStyles()
        return this
    }
    */
    
    onEnterKeyUp (event) {
        //this.debugLog(".onEnterKeyUp()")
        if(this.valueView().activate) {
            this.valueView().activate()
        }
        return this
    }

    setBackgroundColor (c) {
        /*
        this.debugLog(".setBackgroundColor ", c)
        if (c !== "white") {
            console.log("not white")
        }
        */
        super.setBackgroundColor(c)
        return this
    }

    becomeKeyView () {
        this.valueView().becomeKeyView()
        return this
    }

    unselect () {
        super.unselect()
        this.valueView().blur()
        this.keyView().blur()
        return this
    }
    
}.initThisClass()
