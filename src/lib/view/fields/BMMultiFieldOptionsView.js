
BMMultiFieldOptionsView = Div.extend().newSlots({
    type: "BMMultiFieldOptionsView",
}).setSlots({
    init: function () {
        Div.init.apply(this)
        this.setDivClassName("BMMultiFieldOptionsView")
		this.makeUnselectable()
		//this.setItemProto(BMMultiFieldOptionView)
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
	
	setOptionWidths: function(maxWidth) {
		this.items().forEach(function(item) {
			item.setMinAndMaxWidth(maxWidth)
		})
		return this
	},
	
	maxOptionTextWidth: function() {
		var maxWidth = this.items().maxValue(function(item) {
			//console.log("item.width() = ", item.width())
			return DivTextTapeMeasure.widthOfDivClassWithText("BMMultiFieldOptionView", item.innerHTML())
		})	
		//console.log("items.length = " +  this.items().length + " maxWidth = ", maxWidth)
		
		return maxWidth	
	},
	
	adjustOptionWidths: function() {
		var maxWidth = this.maxOptionTextWidth()
		
		var leftPad = 10
		var rightPad = 10
		
		
		this.setOptionWidths(maxWidth)
		
		var itemsPerRow = 1
		
		if (this.items().length > 10) {
			itemsPerRow = Math.ceil(Math.sqrt(this.items()))
		}
		
		var fullWidth = maxWidth * itemsPerRow 
		
		this.setMinAndMaxWidth(fullWidth + leftPad + rightPad)
		
		if (itemsPerRow == 1) {
			this.items().forEach(function(item) {
				item.setTextAlign("left")
				item.setPaddingLeft(leftPad + "px")
				item.setPaddingRight(rightPad + "px")
			})
			//this.parentItem().setMinAndMaxWidth(fullWidth)
			this.setLeft(fullWidth + 30)
		} else {
			this.items().forEach(function(item) {
				item.setPaddingLeft(leftPad + "px")
				item.setTextAlign("left")
				item.setPaddingRight(rightPad + "px")
			})			
			//this.parentItem().textView().setMinAndMaxWidth(maxWidth)
			//this.setLeft(maxWidth + 30)
		}
		
		//this.setLeft(0)
	},
	
	select: function(sender) {
		//console.log("selected " + sender.validValue)
		this.parentItem().select(sender.validValue)
	},
})
