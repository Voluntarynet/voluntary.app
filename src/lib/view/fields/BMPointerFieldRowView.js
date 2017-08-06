
BMPointerFieldRowView = BrowserTitledRow.extend().newSlots({
    type: "BMPointerFieldRowView",
}).setSlots({
    init: function () {
        BrowserTitledRow.init.apply(this)

		this.noteView().setBackgroundImageUrlPath(this.pathForIconName("right"))        
		this.noteView().setBackgroundSize(10, 10)
		this.noteView().setMinAndMaxWidth(10).setMinAndMaxHeight(10)

        return this
    },

	selectedTextColor: function() {
		return "black"
	},
	
	unselectedTextColor: function() {
		return "rgba(0, 0, 0, 0.6)"
	},
	
    selectedBgColor: function() {
        return "rgba(0, 0, 0, 0.1)"
    },

/*
	setIsSelected: function(aBool) {
		BrowserTitledRow.setIsSelected.apply(this, [aBool])
		
		if (this.isSelected()) {
			this.noteView().setOpacity(1)	
		} else {
			this.noteView().setOpacity(0.6)	
		}
		return this
	},
	*/

    updateSubviews: function () {	
		BrowserTitledRow.updateSubviews.apply(this)
        var node = this.node()

		if (this.isSelected()) {
			this.noteView().setOpacity(1)	
		} else {
			this.noteView().setOpacity(0.4)	
		}
		
        return this
    },
})
