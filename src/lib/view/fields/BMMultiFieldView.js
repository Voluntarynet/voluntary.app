
BMMultiFieldView = BMFieldView.extend().newSlots({
    type: "BMMultiFieldView",
	optionsView: null,
}).setSlots({
    init: function () {
        BMFieldView.init.apply(this)
        this.setDivClassName("BMFieldView")
        //this.setDivClassName("BMMultiFieldView")
		//this.keyView().setDisplay("none")
		//this.valueView().setDivClassName("BMTextAreaFieldValueView")
		//this.valueView().setDivClassName("BMMultiFieldValueView")
		
		this.setOptionsView(BMMultiFieldOptionsView.clone())
		this.optionsView().setDisplay("none")
		this.addItem(this.optionsView())
		
		//this.valueView().setTarget(this).setAction("toggleOpen")
		//this.valueView().setDivClassName("BMMultiFieldValueView")
        return this
    },

/*
	setNode: function(aNode) {
		BMFieldView.setNode.apply(this, [aNode])
		//this.valueView().setNode(aNode)
		return this
	},
	*/

	/*
    syncFromNode: function () {
		BMFieldView.syncFromNode.apply(this)
		this.valueView().setContentEditable(false)
		return this
	},

	createValueView: function() {
		return BMMultiFieldValueView.clone()
	},
	*/
	
	
	// ------------------ open / close ------------------
	
	toggleOpen: function() {
		if (!this.isOpen()) { 
			this.open() 
		} else {
			this.close()
		}
		return this
	},
	
	isOpen: function() {
		return this.optionsView().display() != "none"
	},
	
	open: function() {
		if(!this.isOpen()) {
			//this.node().setupOptions()
			console.log(this.type() + " open")
			//this.setIsOpen(true)
			
			this.updateValidValues()
			//this.addItem(this.optionsView())
			this.optionsView().setDisplay("block")
			this.showActive()
		}
	},
	
	close: function() {
		if(this.isOpen()) {
			console.log(this.type() + " close")
			this.optionsView().setDisplay("none")
			//this.removeItem(this.optionsView())
			this.showInactive()
		}
	},
	
	select: function(validValue) {
		console.log(this.type() + " selected " + validValue)
		//this.setInnerHTML(validValue)
		this.node().setValue(validValue)
	},
	
	showActive: function() {
		//this.setBackgroundColor(this.activeBackgroundColor())
		//this.setColor(this.activeColor())
		return this
	},
	
	showInactive: function() {
		//this.setBackgroundColor(this.inactiveBackgroundColor())
		//this.setColor(this.inactiveColor())
		return this
	},
	
	// --------------------------------------
	
	setNode: function(aNode) {
		NodeView.setNode.apply(this, [aNode])
		this.updateValidValues()
		return this
	},
	
	updateValidValues: function() {
		this.optionsView().setValidValues(this.node().validValues())
		return this
	},
	
	/*
	didEdit: function() {
		console.log(this.type() + " didEdit")
		this.syncFromNode()
	},
	*/
	
})

/*
BMMultiFieldOptionView = NodeView.extend().newSlots({
    type: "BMMultiFieldOptionView",
}).setSlots({
})
*/