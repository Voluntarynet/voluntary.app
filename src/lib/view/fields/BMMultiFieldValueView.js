
BMMultiFieldValueView = NodeView.extend().newSlots({
    type: "BMMultiFieldValueView",
	optionsView: null,
	//isOpen: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BMMultiFieldValueView")
		console.log("BMMultiFieldValueView setup")
		this.registerForClicks(true)
		this.registerForMouse(true)
		this.setOptionsView(BMMultiFieldOptionsView.clone())
        return this
    },

	onClick: function() {
		console.log(this.type() + " onClick")
		this.toggleOpen()
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
		return this.items().contains(this.optionsView())
	},
	
	open: function() {
		if(!this.isOpen()) {
			console.log(this.type() + " open")
			//this.setIsOpen(true)
			this.optionsView().setValidValues(this.node().validValues())
			this.addItem(this.optionsView())
			if (!this.hasItem(this.optionsView())) {
				console.log("missing optionsView after add")
			} else {
				console.log("contains optionsView after add")
			}
		}
	},
	
	close: function() {
		if(this.isOpen()) {
			console.log(this.type() + " close")
			//this.setIsOpen(false)
			//var self = this
			//setTimeout(function () { self.removeItem(self.optionsView()) }, 10)
			
			if (!this.hasItem(this.optionsView())) {
				console.log("missing optionsView before close")
			} else {
				console.log("contains optionsView before close")
			}
			
			this.removeItem(this.optionsView())
			this.setBackgroundColor("#fff")
		}
	},
	
	onMouseOver: function() {
		//console.log(this.type() + " onMouseOver")
		this.setBackgroundColor("#eee")
	},
	
	onMouseOut: function() {
		//console.log(this.type() + " onMouseOut")
		//this.close()
		this.setBackgroundColor("#fff")
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

// -------------------------------------------------------------

BMMultiFieldOptionsView = NodeView.extend().newSlots({
    type: "BMMultiFieldOptionsView",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BMMultiFieldOptionsView")
        return this
    },

	onClick: function() {

	},
	
	setValidValues: function(validValues) {
		this.removeAllItems()
		
		var self = this
        this.element().style.transition = "opacity .2s"
		self.setOpacity(0)
		
		validValues.forEach(function(v) {
			var option = Div.clone().setInnerHTML(v).setDivClassName("BMMultiFieldOptionView").setTarget(self).setAction("select")
			option.validValue = v
			self.addItem(option)
		})
		
		setTimeout(function() { 
			self.adjustOptionWidths() 
			self.setOpacity(1)
		} , 1)
		
		return this
	},
	
	adjustOptionWidths: function() {
		var maxWidth = this.items().max(function(item) {
			//console.log("item.width() = ", item.width())
			return item.width()
		}).width()
		
		//console.log("maxWidth = ", maxWidth)
		
		this.items().forEach(function(item) {
			item.setMinAndMaxWidth(maxWidth + 10)
		})
		
		var itemsPerRow = 1
		
		if (this.items().length > 10) {
			itemsPerRow = Math.ceil(Math.sqrt(this.items()))
		}
		
		this.setMinAndMaxWidth((maxWidth * itemsPerRow) )
		
	},
	
	select: function(sender) {
		//console.log("selected " + sender.validValue)
		this.parentItem().select(sender.validValue)
	},
})

// -------------------------------------------------------------

BMMultiFieldOptionView = Div.extend().newSlots({
    type: "BMMultiFieldOptionView",
}).setSlots({
    init: function () {
        Div.init.apply(this)
        this.setDivClassName("BMMultiFieldOptionView")
        return this
    },
})
