
BMMultiFieldValueView = NodeView.extend().newSlots({
    type: "BMMultiFieldValueView",
	optionsView: null,
	//isOpen: false,
	inactiveBackgroundColor: "#fff",
	inactiveColor: "#000",
	
	activeBackgroundColor: "#eee",
	activeColor: "#000",
	
	textView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BMMultiFieldValueView")
		this.registerForClicks(true)
		this.registerForMouse(true)
		
		this.setOptionsView(BMMultiFieldOptionsView.clone())
		this.optionsView().setDisplay("none")
		this.addItem(this.optionsView())
		
		this.setTextView(Div.clone())
		this.addItem(this.textView())
		
		this.showInactive()
		this.makeUnselectable()
		this.setItemProto(null)
        return this
    },

	setText: function(aString) {
		this.textView().setInnerHTML(aString)
		return this
	},
	
	isEditable: function() {
		return this.parentItem().node().valueIsEditable()
	},
	
	onClick: function() {
		console.log(this.type() + " onClick")
		if (this.isEditable()) {
			this.toggleOpen()
		}
	},
	
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
	
	setNode: function(aNode) {
		NodeView.setNode.apply(this, [aNode])
		this.updateValidValues()
		return this
	},
	
	updateValidValues: function() {
		this.optionsView().setValidValues(this.node().validValues())
		return this
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
	
	onMouseOver: function() {
		//console.log(this.type() + " onMouseOver")
		if (this.isEditable()) {
			this.showActive()
		}
	},
	
	onMouseOut: function() {
		//console.log(this.type() + " onMouseOut")
		//this.close()
		if (this.isEditable() && !this.isOpen()) {
			this.showInactive()
		}
	},
	
	showActive: function() {
		this.setBackgroundColor(this.activeBackgroundColor())
		this.setColor(this.activeColor())
		return this
	},
	
	showInactive: function() {
		this.setBackgroundColor(this.inactiveBackgroundColor())
		this.setColor(this.inactiveColor())
		return this
	},
	
	select: function(validValue) {
		console.log(this.type() + " selected " + validValue)
		//this.setInnerHTML(validValue)
		this.parentItem().node().setValue(validValue)
	},
	
	setParentItem: function(anItem) {
		NodeView.setParentItem.apply(this, [anItem])
		console.log(">>>>>>> " + this.type() + " setParentItem " + anItem.type() )
		return this
		
	},
})
