
BMFieldSetView = NodeView.extend().newSlots({
    type: "BMFieldSetView",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BMFieldSetView")
		this.setItemProto(null)
		// calling syncToNode will set up field views
        return this
    },

	syncFromNode: function() {
		NodeView.syncFromNode.apply(this)
		//this.setupKeyViews()
		return this
	},
	
	/*
	setupKeyViews: function() {
		var lastFieldView = null
		var fieldViews = this.items()
		var self = this
		
		fieldViews.forEach(function(fieldView) {
			var next = self.keyFieldAfterFieldView(fieldView).valueView()
			//console.log(fieldView.keyView())
			fieldView.valueView().setNextKeyView(next)
		})
	},
	
	keyFieldAfterFieldView: function(aFieldView) {		
		var fieldViews = this.items()
		
		var nextFieldView = fieldViews.after(aFieldView).detect(function(fieldView) { 
			return fieldView.node().valueIsEditable() 
		})
		
		if (nextFieldView == null) {
			
			nextFieldView = this.items().first()
		}
		
		return nextFieldView
	},
	*/
})
