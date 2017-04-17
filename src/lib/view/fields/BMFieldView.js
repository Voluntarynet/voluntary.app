
BMFieldView = NodeView.extend().newSlots({
    type: "BMFieldView",
	keyView: null,
	valueView: null,
	editableColor: "black",
	uneditableColor: "#aaa",
	errorColor: "red",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setDivClassName("BMFieldView")

		this.setKeyView(this.addItem(Div.clone().setDivClassName("BMFieldKeyView")))
        this.addItem(this.keyView())     
   		this.keyView().turnOffUserSelect().setSpellCheck(false)   
		
        this.setValueView(this.createValueView())
        this.addItem(this.valueView())  
		this.valueView().setSpellCheck(false)      
        
        //his.setEditable(false)
        return this
    },

	createValueView: function() {
		return Div.clone().setDivClassName("BMFieldValueView")
	},

    syncFromNode: function () {
		//console.log("BMFieldView syncFromNode")
		
        var node = this.node()

        this.keyView().setInnerHTML(node.key())
        this.valueView().setInnerHTML(node.value())

		this.keyView().setIsVisible(node.keyIsVisible())
		this.valueView().setIsVisible(node.valueIsVisible())

        
        this.keyView().setContentEditable(node.keyIsEditable())
        this.valueView().setContentEditable(node.valueIsEditable())

		if (!node.valueIsEditable()) {
			//console.log("fieldview key '", node.key(), "' node.valueIsEditable() = ", node.valueIsEditable(), " setColor ", this.uneditableColor())
			this.valueView().setColor(this.uneditableColor())
		} else {
			this.valueView().setColor(this.editableColor())
		}
		
		var color = this.valueView().color()
		
		if (node.valueError()) {
			this.valueView().setColor(this.errorColor())
			//this.valueView().setBackgroundColor(this.errorColor())
			//this.valueView().setColor("white")
			this.valueView().setToolTip(node.valueError())
			
		} else {
			this.valueView().setBackgroundColor("transparent")
			this.valueView().setColor(color)
			this.valueView().setToolTip("")
		}

		// allow for custom view class
		if (node.valueDivClassName()) {
			this.valueView().setDivClassName(node.valueDivClassName())
		}

        return this
    },
    
    syncToNode: function () {
        var node = this.node()

		
		if (node.keyIsEditable()) {
        	node.setKey(this.keyView().innerHTML())
		}
		
		if (node.valueIsEditable()) {
        	node.setValue(this.valueView().innerHTML())
		}
		
        NodeView.syncToNode.apply(this)
        return this
    },
    
    onDidEdit: function (changedView) {     
        //this.log("onDidEdit")   
        this.syncToNode()
    },


    updateSubviews: function() {
        var isEditable = this.node() ? this.node().nodeTitleIsEditable() : false;
        /*
        if (!isEditable) {
            this.title().element().style.color = "black"
        }
        */
        
        this.setEditable(isEditable)
        
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
