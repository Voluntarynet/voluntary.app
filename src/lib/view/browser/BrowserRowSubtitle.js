
BrowserRowSubtitle = DivView.extend().newSlots({
    type: "BrowserRowSubtitle",
	isSelected: false,
	selectedColor: "white",
	unselectedColor: "",
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setInnerHTML("")
        this.turnOffUserSelect()
        return this
    },
    
	setIsSelected: function(aBool) {
	    this._isSelected = aBool
	    this.updateColors()
	    return this
	},
	
	updateColors: function() {
	    if (this.isSelected()) {
	        this.setColor(this.selectedColor())
	    } else {
	        this.setColor(this.unselectedColor())
	    }
	    return this
	},
})


