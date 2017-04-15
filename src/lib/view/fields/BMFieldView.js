
BMFieldView = NodeView.extend().newSlots({
    type: "BMFieldView",
	keyView: null,
	valueView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setDivClassName("BMFieldView")

		this.setKeyView(this.addItem(Div.clone().setDivClassName("BMFieldKeyView")))
        this.addItem(this.keyView())     
   		this.keyView().turnOffUserSelect()
		
        this.setValueView(this.addItem(Div.clone().setDivClassName("BMFieldValueView")))
        this.addItem(this.valueView())        
        
        //his.setEditable(false)
        return this
    },

    syncFromNode: function () {
		console.log("BMFieldView syncFromNode")
		
        var node = this.node()

        this.keyView().setInnerHTML(node.key())
        this.valueView().setInnerHTML(node.value())

		this.keyView().setIsVisible(node.keyIsVisible())
		this.valueView().setIsVisible(node.valueIsVisible())

        
        this.keyView().setContentEditable(node.keyIsEditable())
        this.valueView().setContentEditable(node.valueIsEditable())

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
