"use strict"

/*

    BMFieldRowView

*/

BrowserFieldRow.newSubclassNamed("BMFieldRowView").newSlots({
    keyView: null,
    valueView: null,
    noteView: null,
    editableColor: "black",
    uneditableColor: "#888",
    errorColor: "red",
}).setSlots({
    init: function () {
        BrowserFieldRow.init.apply(this)
        
        this.setKeyView(TextField.clone().setDivClassName("BMFieldKeyView"))
        this.addContentSubview(this.keyView())     
   		this.keyView().turnOffUserSelect().setSpellCheck(false)   
        this.keyView().setMarginLeft(20)

        //this.contentView().setPaddingLeft(20)
        this.setValueView(this.createValueView())
        this.addContentSubview(this.valueView())  
      
        this.valueView().setUserSelect("text")   // should the value view handle this?
        this.valueView().setSpellCheck(false)   // should the value view handle this?
        this.valueView().setWidthPercentage(100) 

        this.setNoteView(DomView.clone().setDivClassName("BMFieldRowViewNoteView"))
        this.addContentSubview(this.noteView())
        this.noteView().setUserSelect("text")
        
        return this
    },

    createValueView: function() {
        const tf = TextField.clone().setDivClassName("BMFieldValueView")
        //tf.setSelectAllOnDoubleClick(true)
        return tf
    },
	
    // visible key and value
    
    visibleValue: function() {
        return this.node().visibleValue()
    },
	
    visibleKey: function() {
        return this.node().key()
    },

    // sync 
    
    syncValueViewToNode: function() {
        //console.log(this.typeId() + ".syncValueViewToNode " + this.node().type())
	    if (this.node().type() === "BMBoolField" && this.valueView().type() !== "BoolView") {
	        //console.log("syncValueViewToNode setup bool view")
	        const boolView = BoolView.clone()
            this.removeContentSubview(this.valueView())  
            this.setValueView(boolView)
            this.addContentSubview(this.valueView())  
            //this.valueView().setUserSelect("text")   // should the value view handle this?
		    //this.valueView().setSpellCheck(false)   // should the value view handle this?	        
		    //return TextField.clone().setDivClassName("BMFieldValueView")
        }
    },
    
    syncFromNode: function () {
        BrowserFieldRow.syncFromNode.apply(this)
        //console.log(this.typeId() + " syncFromNode")
		
        this.node().prepareToSyncToView()
        this.syncValueViewToNode() // (lazy) set up the value view to match the field's type

        const node = this.node()
        const keyView = this.keyView()
        const valueView = this.valueView()
		
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

        if (!node.valueIsEditable()) {
            //console.log("fieldview key '", node.key(), "' node.valueIsEditable() = ", node.valueIsEditable(), " setColor ", this.uneditableColor())
            valueView.setColor(this.uneditableColor())
        } else {
            valueView.setColor(this.editableColor())
        }
		
        // change color if value is invalid
		
        const color = valueView.color()
		
        if (node.valueError()) {
            valueView.setColor(this.errorColor())
            valueView.setToolTip(node.valueError())
			
        } else {
            valueView.setBackgroundColor("transparent")
            valueView.setColor(color)
            valueView.setToolTip("")
        }
				
        if (this.visibleNote()) {
            this.noteView().setInnerHTML(this.visibleNote())
        } else {
            this.noteView().setInnerHTML("")
        }

        return this
    },

    visibleNote: function() {
        return this.node().note()
    },
    
    syncToNode: function () {
        const node = this.node()

        if (node.keyIsEditable()) {
        	node.setKey(this.keyView().value())
        }
	
        if (node.valueIsEditable()) {
        	node.setValue(this.valueView().value())
        }
		
        NodeView.syncToNode.apply(this)
        return this
    },
    
    onDidEdit: function (changedView) {     
        //this.log(this.type() + " onDidEdit")   
        this.node().setKey(this.keyView().value())
        this.node().setValue(this.valueView().value())
        this.node().didUpdateView(this)
        this.scheduleSyncFromNode() // needed for validation?
    },

    updateSubviews: function() {
        BrowserFieldRow.updateSubviews.apply(this)
		
        const node = this.node()

        if (node && node.nodeRowMinHeight()) {
            if (node.nodeRowMinHeight() === -1) {
                this.setHeight("auto")
                this.setPaddingBottom("calc(100% - 20px)")

            } else {
                this.setHeight(this.pxNumberToString(node.nodeRowMinHeight()))
            }
        }
        
        return this
    },

    /*
    applyStyles: function() {
        BrowserFieldRow.applyStyles.apply(this)
        return this
    },
    */
    
    onEnterKeyUp: function() {
        //console.log(this.typeId() + ".onEnterKeyUp()")
        if(this.valueView().activate) {
            this.valueView().activate()
        }
        return this
    },

    setBackgroundColor: function(c) {
        /*
        console.log(this.typeId() + ".setBackgroundColor ", c)
        if (c !== "white") {
            console.log("not white")
        }
        */
        BrowserFieldRow.setBackgroundColor.apply(this, [c])
        return this
    },
})
