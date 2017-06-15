
BMMultiFieldOptionsView = Div.extend().newSlots({
    type: "BMMultiFieldOptionsView",
	validValues: null,
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
	
	hasValidValues: function(validValues) {
		if (this._validValues) {
			if (this._validValues.equals(validValues)) {
				return true
			}
		}
		return false
	},
	
	setValidValues: function(validValues) {
		if (!this.hasValidValues(validValues)) {
			this._validValues = validValues
			this.updatedValidValues()
		}
		return this
	},
		
	updatedValidValues: function() {
		this.removeAllItems()
		
        this.element().style.transition = "opacity .2s"
		this.setOpacity(0)
		
		this._validValues.forEach((v) => {
			var option = Div.clone().setInnerHTML(v).setDivClassName("BMMultiFieldOptionView").setTarget(this).setAction("select")
			option.validValue = v
			this.addItem(option)
		})
		
		setTimeout(() => { 
			this.adjustOptionWidths() 
			this.setOpacity(1)
		}, 1)
		
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
			itemsPerRow = Math.ceil(Math.sqrt(this.items().length))
		}
		
		var fullWidth = maxWidth * itemsPerRow 
		var w = fullWidth + leftPad + rightPad
		
		//this.setMinAndMaxWidth(w)
		
		this.items().forEach(function(item) {
			//item.setTextAlign("left")
			//item.setPaddingLeft(leftPad)
			//item.setPaddingRight(rightPad)
			item.setMinAndMaxWidth(w)
		})
		
		//var rowCount = this.items().length / itemsPerRow
		//var h = rowCount * 26
		//console.log("maxHeight = ", h)
		//this.setMinAndMaxHeight(h)
		
		/*
		console.log(this.type() + " maxWidth: ", maxWidth)
		console.log(this.type() + " itemsPerRow: ", itemsPerRow)
		console.log(this.type() + " fullWidth: ", fullWidth)
		console.log(this.type() + " setMinAndMaxWidth: ", w)
		*/
		
		/*
		if (itemsPerRow == 1) {
			this.items().forEach(function(item) {
				item.setTextAlign("left")
				item.setPaddingLeft(leftPad)
				item.setPaddingRight(rightPad)
			})
			//this.parentItem().setMinAndMaxWidth(fullWidth)
			//this.setLeft(fullWidth + 30)
		} else {
			this.items().forEach(function(item) {
				item.setTextAlign("left")
				item.setPaddingLeft(leftPad)
				item.setPaddingRight(rightPad)
			})			
			//this.parentItem().textView().setMinAndMaxWidth(maxWidth)
			//this.setLeft(maxWidth + 30)
		}
		*/
		
		//this.setLeft(0)
	},
	
	select: function(sender) {
		//console.log("selected " + sender.validValue)
		this.parentItem().select(sender.validValue)
	},
})
