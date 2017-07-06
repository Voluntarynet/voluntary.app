
BMFieldSetView = NodeView.extend().newSlots({
    type: "BMFieldSetView",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BMFieldSetView")
		this.setSubviewProto(null)
		// calling syncToNode will set up field views
        return this
    },
	
	/*

	// tabing between fields
	
	syncFromNode: function() {
		NodeView.syncFromNode.apply(this)
		//this.setupKeyViews()
		return this
	},
	
	setupKeyViews: function() {
		var lastFieldView = null
		var fieldViews = this.subviews()
		
		fieldViews.forEach((fieldView) => {
			var next = this.keyFieldAfterFieldView(fieldView).valueView()
			//console.log(fieldView.keyView())
			fieldView.valueView().setNextKeyView(next)
		})
	},
	
	keyFieldAfterFieldView: function(aFieldView) {		
		var fieldViews = this.subviews()
		
		var nextFieldView = fieldViews.after(aFieldView).detect(function(fieldView) { 
			return fieldView.node().valueIsEditable() 
		})
		
		if (nextFieldView == null) {
			
			nextFieldView = this.subviews().first()
		}
		
		return nextFieldView
	},
	*/
})
