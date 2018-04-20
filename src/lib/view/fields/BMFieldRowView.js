"use strict"

window.BMFieldRowView = BrowserFieldRow.extend().newSlots({
    type: "BMFieldRowView",
	keyView: null,
	valueView: null,
	noteView: null,
	editableColor: "black",
	uneditableColor: "#888",
	errorColor: "red",
}).setSlots({
    init: function () {
        BrowserFieldRow.init.apply(this)
        
		this.setKeyView(this.addSubview(DivView.clone().setDivClassName("BMFieldKeyView")))
        this.addSubview(this.keyView())     
   		this.keyView().turnOffUserSelect().setSpellCheck(false)   
		//this.keyView().setMinAndMaxWidth("200")
		
        this.setValueView(this.createValueView())
        this.addSubview(this.valueView())  
      
        this.valueView().setUserSelect("text")   // should the value view handle this?
		this.valueView().setSpellCheck(false)   // should the value view handle this?
		
		this.setNoteView(DivView.clone().setDivClassName("BMFieldRowViewNoteView"))
		this.addSubview(this.noteView())
        this.noteView().setUserSelect("text")
        
        //this.setEditable(false)
        return this
    },

	createValueView: function() {
		return TextField.clone().setDivClassName("BMFieldValueView")
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
        //console.log(this.type() + ".syncFromNode " + this.node().type())
	    if (this.node().type() == "BMBoolField" && this.valueView().type() != "BoolView") {
	        //console.log("syncValueViewToNode setup bool view")
	        var boolView = BoolView.clone()
            this.removeSubview(this.valueView())  
            this.setValueView(boolView)
            this.addSubview(this.valueView())  
            //this.valueView().setUserSelect("text")   // should the value view handle this?
		    //this.valueView().setSpellCheck(false)   // should the value view handle this?	        
		    //return TextField.clone().setDivClassName("BMFieldValueView")
        }
	},
    
    syncFromNode: function () {
		BrowserFieldRow.syncFromNode.apply(this)
		//console.log(this.type() + " syncFromNode")
		
		this.node().prepareToSyncToView()
		this.syncValueViewToNode()

        var node = this.node()
		var keyView = this.keyView()
		var valueView = this.valueView()
		
		if (node.isVisible()) {
			this.setDisplay("block")
		} else {
			this.setDisplay("none")
		}

        keyView.setSafeInnerHTML(this.visibleKey())

        var newValue = this.visibleValue()
		
		/*
        console.log("")
        console.log("FieldRow.syncFromNode:")
        console.log("  valueView.type() == ", valueView.type())
        console.log("  valueView.innerHTML() == '" + valueView.innerHTML() + "'")
        console.log("  valueView.value == ", valueView.value)
        console.log("  newValue =  '" + newValue + "'")
        */
        
        valueView.setValue(newValue)
		
		keyView.setIsVisible(node.keyIsVisible())
		valueView.setIsVisible(node.valueIsVisible())
		
        
        keyView.setIsEditable(node.keyIsEditable())
        valueView.setIsEditable(node.valueIsEditable())

		if (!node.valueIsEditable()) {
			//console.log("fieldview key '", node.key(), "' node.valueIsEditable() = ", node.valueIsEditable(), " setColor ", this.uneditableColor())
			valueView.setColor(this.uneditableColor())
		} else {
			valueView.setColor(this.editableColor())
		}
		
		// change color if value is invalid
		
		var color = valueView.color()
		
		if (node.valueError()) {
			valueView.setColor(this.errorColor())
			valueView.setToolTip(node.valueError())
			
		} else {
			valueView.setBackgroundColor("transparent")
			valueView.setColor(color)
			valueView.setToolTip("")
		}
				
		if (this.visibleNote()) {
			this.noteView().setSafeInnerHTML(this.visibleNote())
		} else {
			this.noteView().setSafeInnerHTML("")
		}
		
		/*
		this.setBackgroundColor("white")
		if (this.isSelected()) {
			this.setBackgroundColor("CBCBCB")
		} else {
			this.setBackgroundColor("white")
		}
		*/

        return this
    },

	visibleNote: function() {
		return this.node().note()
	},
    
    syncToNode: function () {
        var node = this.node()

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
        this.scheduleSyncToNode() //this.syncToNode()
        
		this.node().didUpdateView(this)
		//this.node().tellParentNodes("onDidEditNode", this.node())   
		this.scheduleSyncFromNode() // needed for validation?
    },

    updateSubviews: function() {
		BrowserFieldRow.updateSubviews.apply(this)
		
        var node = this.node()

        if (node && node.nodeMinHeight()) {
            var e = this.element()
            if (node.nodeMinHeight() == -1) {
                
                e.style.height = "auto"
                e.style.paddingBottom = "calc(100% - 20px)";

            } else {
                e.style.height = node.nodeMinHeight() + "px"
            }
        }
        
        return this
    },
})
