
BMMultiFieldValueView = NodeView.extend().newSlots({
    type: "BMMultiFieldValueView",

	//textView: null,

	inactiveBackgroundColor: "#fff",
	inactiveColor: "#000",
	
	activeBackgroundColor: "#eee",
	activeColor: "#000",
	
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BMMultiFieldValueView")
		//this.registerForClicks(true)
		//this.registerForMouse(true)
		
		//this.setTextView(Div.clone().setDivClassName("BMMultiFieldValueTextView"))
		//this.addItem(this.textView())
		//this.textView().setContentEditable(true)
		
		
		//this.showInactive()
		//this.setItemProto(null)
        return this
    },
	/*

	makeTextUneditable: function() {
		this.makeUnselectable()
	},

	isEditable: function() {
		return this.parentItem().node().valueIsEditable()
	},
	
	onClick: function() {
		//console.log(this.type() + " onClick")
		if (this.isEditable()) {
			this.parentItem().toggleOpen()
		}
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
	*/

	/*
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
		//this.setBackgroundColor(this.activeBackgroundColor())
		//this.setColor(this.activeColor())
		return this
	},
	
	showInactive: function() {
		//this.setBackgroundColor(this.inactiveBackgroundColor())
		//this.setColor(this.inactiveColor())
		return this
	},
	*/
	

	
	/*
	setParentItem: function(anItem) {
		NodeView.setParentItem.apply(this, [anItem])
		//console.log(">>>>>>> " + this.type() + " setParentItem " + anItem.type() )
		return this
	},
	*/
})
